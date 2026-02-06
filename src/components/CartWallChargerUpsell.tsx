import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import wallChargerImage from "@/assets/wall-charger-240w.webp";

interface CartWallChargerUpsellProps {
  cartItems: CartItem[];
}

// Detect bundle type from cart items
const detectBundleType = (items: CartItem[]): 'single' | 'duo' | 'family' => {
  for (const item of items) {
    const handle = item.product.node.handle?.toLowerCase() || '';
    const title = item.product.node.title?.toLowerCase() || '';
    
    if (handle.includes('family') || handle.includes('3x') || title.includes('family') || title.includes('3x')) {
      return 'family';
    }
    if (handle.includes('duo') || handle.includes('2x') || title.includes('duo') || title.includes('2x')) {
      return 'duo';
    }
  }
  return 'single';
};

// Check if wall charger is already in cart
const isWallChargerInCart = (items: CartItem[]): boolean => {
  return items.some(item => {
    const handle = item.product.node.handle?.toLowerCase() || '';
    const title = item.product.node.title?.toLowerCase() || '';
    return handle.includes('wall-charger') || title.includes('wall charger');
  });
};

export const CartWallChargerUpsell = ({ cartItems }: CartWallChargerUpsellProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const { data: wallChargerProductNode, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['wall-charger-product'],
    queryFn: () => fetchProductByHandle("wall-charger-240w-gan"),
    staleTime: 1000 * 60 * 5,
  });

  const bundleType = detectBundleType(cartItems);
  const alreadyInCart = isWallChargerInCart(cartItems);

  // Pricing based on bundle type
  const getPricing = () => {
    switch (bundleType) {
      case 'family':
        return { price: 0, label: 'FREE', originalPrice: 19.90, saving: 19.90 };
      case 'duo':
        return { price: 9.95, label: '$9.95', originalPrice: 19.90, saving: 9.95 };
      default:
        return { price: 19.90, label: '$19.90', originalPrice: 19.90, saving: 0 };
    }
  };

  const pricing = getPricing();

  const handleAddToCart = async () => {
    if (!wallChargerProductNode || isAdding || isAdded || alreadyInCart) return;

    const variant = wallChargerProductNode.variants?.edges?.[0]?.node;
    if (!variant) return;

    setIsAdding(true);
    try {
      // Wrap the node in ShopifyProduct format for cart store
      const wrappedProduct: ShopifyProduct = { node: wallChargerProductNode };

      // Create a custom title based on the discount
      let customTitle = "Wall Charger 240W GaN";
      if (bundleType === 'family') {
        customTitle = "Wall Charger 240W GaN (FREE with Family Pack)";
      } else if (bundleType === 'duo') {
        customTitle = "Wall Charger 240W GaN (50% OFF with Duo)";
      }

      await addItem({
        product: wrappedProduct,
        variantId: variant.id,
        variantTitle: customTitle,
        price: { amount: pricing.price.toString(), currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: variant.selectedOptions || []
      });

      setIsAdded(true);
    } catch (error) {
      console.error("Failed to add wall charger:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Don't show if already in cart or no cable products
  if (alreadyInCart || cartItems.length === 0) {
    return null;
  }

  // Don't show while loading product
  if (isLoadingProduct || !wallChargerProductNode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-700 uppercase">Complete Your Setup</span>
        {bundleType === 'family' && (
          <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
            FREE
          </Badge>
        )}
        {bundleType === 'duo' && (
          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
            50% OFF
          </Badge>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-amber-200">
          <img
            src={wallChargerImage}
            alt="Wall Charger 240W GaN"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">Wall Charger 240W GaN</h4>
          <p className="text-xs text-muted-foreground">5-Port Fast Charger</p>
          <div className="flex items-center gap-2 mt-1">
            {pricing.price === 0 ? (
              <span className="text-sm font-bold text-green-600">FREE</span>
            ) : (
              <span className="text-sm font-bold text-amber-600">${pricing.price.toFixed(2)}</span>
            )}
            {pricing.saving > 0 && pricing.price > 0 && (
              <span className="text-xs text-muted-foreground line-through">${pricing.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={isAdding || isAdded}
          className={`flex-shrink-0 ${
            isAdded 
              ? 'bg-green-500 hover:bg-green-500' 
              : bundleType === 'family'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-amber-500 hover:bg-amber-600'
          } text-white`}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isAdded ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>

      {bundleType === 'family' && (
        <p className="text-[10px] text-green-600 mt-2 text-center font-medium">
          🎁 Included FREE with your Family Pack!
        </p>
      )}
      {bundleType === 'duo' && (
        <p className="text-[10px] text-amber-600 mt-2 text-center font-medium">
          ⚡ Save $9.95 with your Duo Pack!
        </p>
      )}
    </div>
  );
};
