import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, CheckCircle, Sparkles, Package, Loader2 } from "lucide-react";
import { trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";

export const UpsellModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const { items, addItem, removeItem, isLoading } = useCartStore();
  const { data: products } = useProducts();

  // Find the Family Pack product
  const familyPackProduct = products?.find(
    (p) => p.node.handle.toLowerCase().includes("family") || p.node.handle.toLowerCase().includes("3x")
  );

  // Listen for cart changes to detect new additions
  useEffect(() => {
    const currentTotalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Store previous total quantity
    const prevTotalQty = parseInt(sessionStorage.getItem("cart-total-qty") || "0");
    sessionStorage.setItem("cart-total-qty", currentTotalQty.toString());
    
    // If quantity increased (item was added)
    if (currentTotalQty > prevTotalQty && items.length > 0) {
      const newestItem = items[items.length - 1];
      
      // Don't show upsell if already added Family Pack
      const isAlreadyFamilyPack = newestItem.product.node.handle.toLowerCase().includes("family") ||
                                   newestItem.product.node.handle.toLowerCase().includes("3x");
      
      // Also check if cart contains a Family Pack already
      const cartHasFamilyPack = items.some(item => 
        item.product.node.handle.toLowerCase().includes("family") ||
        item.product.node.handle.toLowerCase().includes("3x")
      );
      
      // Check if user has already seen upsell in this session
      const hasSeenUpsell = sessionStorage.getItem("upsell-shown-session");
      
      if (!isAlreadyFamilyPack && !cartHasFamilyPack && !hasSeenUpsell && familyPackProduct) {
        setLastAddedItem(newestItem);
        // Small delay to let cart drawer close first
        setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem("upsell-shown-session", "true");
        }, 800);
      }
    }
  }, [items, familyPackProduct]);

  const handleUpgrade = async () => {
    if (!familyPackProduct || !lastAddedItem) return;
    
    setIsUpgrading(true);
    
    try {
      // Remove the original item
      await removeItem(lastAddedItem.variantId);
      
      // Add Family Pack
      const familyVariant = familyPackProduct.node.variants.edges[0]?.node;
      if (familyVariant) {
        await addItem({
          product: familyPackProduct,
          variantId: familyVariant.id,
          variantTitle: familyVariant.title,
          price: familyVariant.price,
          quantity: 1,
          selectedOptions: familyVariant.selectedOptions || [],
        });
        
        // Track upsell conversion - Facebook Pixel
        trackAddToCart({
          content_name: familyPackProduct.node.title,
          content_ids: [familyVariant.id],
          content_type: "product",
          value: parseFloat(familyVariant.price.amount),
          currency: familyVariant.price.currencyCode,
        });
        
        // Track upsell conversion - Database analytics
        trackAnalyticsEvent('add_to_cart', {
          product_name: familyPackProduct.node.title,
          bundle_type: 'family',
          price: parseFloat(familyVariant.price.amount),
          variant_id: familyVariant.id,
          source: 'upsell_modal'
        });
      }
      
      setIsOpen(false);
      // Open cart to show the upgrade
      useCartStore.getState().setIsOpen(true);
    } catch (error) {
      console.error("Failed to upgrade:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!familyPackProduct) return null;

  const familyVariant = familyPackProduct.node.variants.edges[0]?.node;
  const familyPrice = familyVariant ? parseFloat(familyVariant.price.amount) : 44.90;
  const originalPrice = 49.90 * 3; // 3 cables at original price
  const savings = originalPrice - familyPrice;
  const familyImage = familyPackProduct.node.images?.edges?.[0]?.node?.url;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-lg p-0 overflow-hidden border-0 mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 p-4 sm:p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 text-center">
            <Badge className="bg-white text-amber-600 hover:bg-white mb-2 sm:mb-3 font-bold px-2 sm:px-3 py-1 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              SMART UPGRADE
            </Badge>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white text-center">
                🏆 Want to Save Even More?
              </DialogTitle>
              <DialogDescription className="text-white/90 text-center mt-1 sm:mt-2 text-sm">
                Upgrade to our best value pack!
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Product comparison - stacks on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Current item */}
            <div className="flex-1 p-3 bg-gray-50 rounded-lg opacity-60">
              <div className="text-xs text-gray-500 mb-1">You added:</div>
              <div className="font-medium text-sm truncate">
                {lastAddedItem?.product.node.title}
              </div>
              <div className="text-sm font-bold text-gray-600">
                ${lastAddedItem ? parseFloat(lastAddedItem.price.amount).toFixed(2) : "24.90"}
              </div>
            </div>

            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0 rotate-90 sm:rotate-0 mx-auto sm:mx-0" />

            {/* Family Pack */}
            <div className="flex-1 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-400 relative">
              <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px]">
                BEST VALUE
              </Badge>
              <div className="text-xs text-amber-600 mb-1 font-medium">Upgrade to:</div>
              <div className="font-bold text-sm">Family Pack (3x)</div>
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-amber-600">${familyPrice.toFixed(2)}</span>
                <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Save <strong className="text-amber-600">${savings.toFixed(2)}</strong> vs buying separately</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>3 cables for all your devices</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Perfect for home, office & travel</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span><strong>70% OFF</strong> - Biggest discount available</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading || isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-5 sm:py-6 text-sm sm:text-base font-bold shadow-lg shadow-orange-500/30"
            >
              {isUpgrading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  YES! UPGRADE TO FAMILY PACK
                </>
              )}
            </Button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              No thanks, keep my current selection
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
