import { useEffect, useState, useCallback } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { Zap, CheckCircle, Loader2, AlertTriangle, Gift, Flame, Timer, Package } from "lucide-react";
import { trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";

const WALL_CHARGER_HANDLE = "wall-charger-240w-gan";

// Countdown hook for urgency
const useCountdown = (seconds: number) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return { minutes, seconds: secs, expired: timeLeft <= 0 };
};

export const ChargerUpsellModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [triggerItem, setTriggerItem] = useState<CartItem | null>(null);
  const { items, addItem, isLoading } = useCartStore();
  const countdown = useCountdown(180); // 3 minutes urgency

  // Fetch wall charger product
  const { data: chargerProduct } = useQuery({
    queryKey: ['wall-charger-upsell'],
    queryFn: () => fetchProductByHandle(WALL_CHARGER_HANDLE),
    staleTime: 1000 * 60 * 5,
  });

  // Check if cart contains a cable (triggers upsell)
  const hasCableInCart = useCallback(() => {
    return items.some(item => {
      const handle = item.product.node.handle.toLowerCase();
      return handle.includes('chargestand') && !handle.includes('charger');
    });
  }, [items]);

  // Check if charger already in cart
  const hasChargerInCart = useCallback(() => {
    return items.some(item => 
      item.product.node.handle.toLowerCase().includes('charger')
    );
  }, [items]);

  // Listen for cart additions
  useEffect(() => {
    const currentQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const prevQty = parseInt(sessionStorage.getItem("cart-qty-charger") || "0");
    sessionStorage.setItem("cart-qty-charger", currentQty.toString());

    // Item was added
    if (currentQty > prevQty && items.length > 0) {
      const newestItem = items[items.length - 1];
      const isCharger = newestItem.product.node.handle.toLowerCase().includes('charger');
      const alreadyShown = sessionStorage.getItem("charger-upsell-shown");

      // Show upsell if:
      // - Added a cable (not a charger)
      // - Don't already have charger in cart
      // - Haven't shown this session
      if (!isCharger && hasCableInCart() && !hasChargerInCart() && !alreadyShown && chargerProduct) {
        setTriggerItem(newestItem);
        setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem("charger-upsell-shown", "true");
        }, 1500); // Delay after cart drawer
      }
    }
  }, [items, chargerProduct, hasCableInCart, hasChargerInCart]);

  const handleAddCharger = async () => {
    if (!chargerProduct) return;
    
    setIsAdding(true);
    try {
      const variant = chargerProduct.variants?.edges?.[0]?.node;
      if (!variant) return;

      await addItem({
        product: { node: chargerProduct } as ShopifyProduct,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });

      trackAddToCart({
        content_name: chargerProduct.title,
        content_ids: [variant.id],
        content_type: "product",
        value: parseFloat(variant.price.amount),
        currency: variant.price.currencyCode,
      });

      trackAnalyticsEvent('add_to_cart', {
        product_name: chargerProduct.title,
        price: parseFloat(variant.price.amount),
        variant_id: variant.id,
        source: 'charger_upsell_modal'
      });

      setIsOpen(false);
      useCartStore.getState().setIsOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  if (!chargerProduct) return null;

  const variant = chargerProduct.variants?.edges?.[0]?.node;
  const chargerPrice = 19.90;
  const originalPrice = 39.90;
  const savings = originalPrice - chargerPrice;
  const chargerImage = chargerProduct.images?.edges?.[0]?.node?.url;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-lg p-0 overflow-hidden border-0 mx-auto">
        {/* Urgency Header */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 p-4 sm:p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
          
          <div className="relative z-10 text-center">
            {/* Limited Time Badge */}
            <div className="flex justify-center gap-2 mb-2">
              <Badge className="bg-white text-red-600 hover:bg-white font-bold px-3 py-1 text-xs animate-pulse">
                <Timer className="w-3 h-3 mr-1" />
                LIMITED TIME
              </Badge>
              {!countdown.expired && (
                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 font-bold px-3 py-1 text-xs">
                  {countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}
                </Badge>
              )}
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white text-center">
                ⚡ WAIT! Don't Miss This!
              </DialogTitle>
              <DialogDescription className="text-white/90 text-center mt-1 text-sm">
                Complete your charging setup & save 50%
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Your cable needs a powerful charger!</p>
              <p className="text-amber-700 text-xs mt-1">
                Most chargers only deliver 18W. Without 240W power, your ChargeStand™ won't reach its full potential.
              </p>
            </div>
          </div>

          {/* Product Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200 relative">
            <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg">
              <Gift className="w-3 h-3 mr-1" />
              50% OFF TODAY ONLY
            </Badge>
            
            <div className="flex gap-4 mt-2">
              {/* Image */}
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                {chargerImage ? (
                  <img 
                    src={chargerImage} 
                    alt={chargerProduct.title}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Zap className="w-10 h-10 text-amber-400" />
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{chargerProduct.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-orange-600">${chargerPrice.toFixed(2)}</span>
                  <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-600">Only 4 left at this price!</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-2 text-xs bg-white rounded-lg p-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span><strong>240W</strong> GaN Power</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white rounded-lg p-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span><strong>5 Ports</strong> for all devices</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Unlocks <strong className="text-orange-600">full 240W speed</strong> of your ChargeStand™</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Charge <strong>5 devices simultaneously</strong> - phone, tablet, laptop & more</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Save <strong className="text-emerald-600">${savings.toFixed(2)}</strong> vs buying separately later</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span><strong>FREE worldwide shipping</strong> when bundled</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAddCharger}
              disabled={isAdding || isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-base font-bold shadow-lg shadow-red-500/30 animate-pulse hover:animate-none"
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  YES! ADD CHARGER FOR ${chargerPrice.toFixed(2)}
                </>
              )}
            </Button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              No thanks, I'll pay full price later (${originalPrice.toFixed(2)})
            </button>
          </div>

          {/* Final Urgency */}
          <p className="text-center text-xs text-gray-500">
            ⏰ This exclusive offer expires when you close this window
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
