import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  ShopifyProduct, 
  storefrontApiRequest, 
  fetchProductByHandle,
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  formatCheckoutUrl,
  isCartNotFoundError
} from '@/lib/shopify';
import { trackAnalyticsEvent } from '@/hooks/useAnalyticsTracking';

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  isGift?: boolean;
}

const WALL_CHARGER_HANDLE = 'wall-charger-240w-gan';
const FREE_CHARGER_DISCOUNT_CODE = 'FREECHARGER';

function isFamilyPack(product: ShopifyProduct): boolean {
  const handle = product.node.handle.toLowerCase();
  const title = product.node.title.toLowerCase();
  return handle.includes('family') || handle.includes('famille') || title.includes('family') || title.includes('famille');
}

function hasFamilyPackInItems(items: CartItem[]): boolean {
  return items.some(item => isFamilyPack(item.product) && !item.isGift);
}

function hasChargerGiftInItems(items: CartItem[]): boolean {
  return items.some(item => item.isGift === true);
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
  autoAddFreeCharger: () => Promise<void>;
  autoRemoveFreeCharger: () => Promise<void>;
}

async function createShopifyCart(item: CartItem): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error('Cart creation failed:', data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

async function addLineToShopifyCart(cartId: string, item: CartItem): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Add line failed:', userErrors);
    return { success: false };
  }

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Update line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Remove line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      isOpen: false,
      setIsOpen: (open: boolean) => set({ isOpen: open }),

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }]
              });
              trackAnalyticsEvent('add_to_cart', {
                product_name: item.product.node.title,
                variant_id: item.variantId,
                price: parseFloat(item.price.amount),
                quantity: item.quantity,
                currency: item.price.currencyCode
              });
              // Auto-add free charger if Family Pack
              if (isFamilyPack(item.product)) {
                await get().autoAddFreeCharger();
              }
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) {
              console.error('Cannot update quantity for item without lineId:', existingItem);
              return;
            }
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({ items: currentItems.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i) });
              trackAnalyticsEvent('add_to_cart', {
                product_name: item.product.node.title,
                variant_id: item.variantId,
                price: parseFloat(item.price.amount),
                quantity: item.quantity,
                currency: item.price.currencyCode
              });
            } else if (result.cartNotFound) {
              clearCart();
            }
          } else {
            const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
            if (result.success) {
              const currentItems = get().items;
              set({ items: [...currentItems, { ...item, lineId: result.lineId ?? null }] });
              trackAnalyticsEvent('add_to_cart', {
                product_name: item.product.node.title,
                variant_id: item.variantId,
                price: parseFloat(item.price.amount),
                quantity: item.quantity,
                currency: item.price.currencyCode
              });
              // Auto-add free charger if Family Pack and no gift yet
              if (isFamilyPack(item.product) && !hasChargerGiftInItems(get().items)) {
                await get().autoAddFreeCharger();
              }
            } else if (result.cartNotFound) {
              clearCart();
            }
          }
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({ items: currentItems.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter(i => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
            // Auto-remove charger gift if no more Family Pack
            if (isFamilyPack(item.product) && !item.isGift) {
              const updatedItems = get().items;
              if (!hasFamilyPackInItems(updatedItems)) {
                await get().autoRemoveFreeCharger();
              }
            }
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error('Failed to remove item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      
      getCheckoutUrl: () => {
        const { checkoutUrl, items } = get();
        if (!checkoutUrl) return null;
        // Auto-apply discount code if Family Pack + charger gift in cart
        if (hasFamilyPackInItems(items) && hasChargerGiftInItems(items)) {
          try {
            const url = new URL(checkoutUrl);
            url.searchParams.set('discount', FREE_CHARGER_DISCOUNT_CODE);
            return url.toString();
          } catch {
            return checkoutUrl;
          }
        }
        return checkoutUrl;
      },

      autoAddFreeCharger: async () => {
        const { cartId, items } = get();
        if (!cartId || hasChargerGiftInItems(items)) return;
        
        try {
          const chargerProduct = await fetchProductByHandle(WALL_CHARGER_HANDLE);
          if (!chargerProduct) return;
          
          const variant = chargerProduct.variants?.edges?.[0]?.node;
          if (!variant) return;
          
          const giftItem: CartItem = {
            lineId: null,
            product: { node: chargerProduct } as ShopifyProduct,
            variantId: variant.id,
            variantTitle: variant.title,
            price: variant.price,
            quantity: 1,
            selectedOptions: variant.selectedOptions || [],
            isGift: true,
          };
          
          const result = await addLineToShopifyCart(cartId, giftItem);
          if (result.success) {
            const currentItems = get().items;
            set({ items: [...currentItems, { ...giftItem, lineId: result.lineId ?? null }] });
          }
        } catch (error) {
          console.error('Failed to auto-add free charger:', error);
        }
      },

      autoRemoveFreeCharger: async () => {
        const { items, cartId, clearCart } = get();
        const giftItem = items.find(i => i.isGift === true);
        if (!giftItem?.lineId || !cartId) return;
        
        try {
          const result = await removeLineFromShopifyCart(cartId, giftItem.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter(i => !i.isGift);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          }
        } catch (error) {
          console.error('Failed to auto-remove free charger:', error);
        }
      },

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (error) {
          console.error('Failed to sync cart with Shopify:', error);
        } finally {
          set({ isSyncing: false });
        }
      }
    }),
    {
      name: 'shopify-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    }
  )
);
