import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, Loader2, Lock, Truck, RotateCcw, CheckCircle, Clock } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { trackInitiateCheckout } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";
import paymentBadges from "@/assets/payment-badges.png";

const ORIGINAL_UNIT_PRICE = 49.90;

const getBundleSize = (product: { node: { handle: string; title: string } }): number => {
  const handle = product.node.handle.toLowerCase();
  const title = product.node.title.toLowerCase();
  
  if (handle.includes('family') || handle.includes('3x') || title.includes('3x') || title.includes('family')) return 3;
  if (handle.includes('duo') || handle.includes('2x') || title.includes('2x') || title.includes('duo')) return 2;
  return 1;
};

const useCountdown = () => {
  const [endDate] = useState(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  });

  const calculateTimeLeft = () => {
    const difference = endDate.getTime() - new Date().getTime();
    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
};

export const CartDrawer = () => {
  const { items, isLoading, isSyncing, isOpen, setIsOpen, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    if (item.isGift) return sum; // Gift items are free
    return sum + (parseFloat(item.price.amount) * item.quantity);
  }, 0);
  const timeLeft = useCountdown();
  
  const totalOriginalPrice = items.reduce((sum, item) => {
    if (item.isGift) return sum;
    const bundleSize = getBundleSize(item.product);
    return sum + (ORIGINAL_UNIT_PRICE * bundleSize * item.quantity);
  }, 0);
  const totalSavings = totalOriginalPrice - totalPrice;

  useEffect(() => { 
    if (isOpen) syncCart(); 
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      const currency = items[0]?.price.currencyCode || 'EUR';
      
      trackInitiateCheckout({
        content_ids: items.map(item => item.variantId),
        content_type: 'product',
        value: totalPrice,
        currency: currency,
        num_items: totalItems
      });
      
      trackAnalyticsEvent('checkout_start', {
        total_value: totalPrice,
        total_items: totalItems,
        currency: currency
      });
      
      window.open(checkoutUrl, '_blank');
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-11 w-11 border-2 border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-600">
          <ShoppingCart className="h-6 w-6 text-amber-600" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-amber-500 text-white shadow-lg">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full p-0">
        <SheetHeader className="flex-shrink-0 p-4 pb-2">
          <SheetTitle>Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {/* Flash Sale Urgency Banner */}
        {items.length > 0 && (
          <div className="mx-4 mb-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-2.5 px-3 rounded-lg relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 relative z-10">
              <span className="text-sm">⚡</span>
              <span className="text-sm font-bold">FLASH SALE ENDS IN:</span>
              <div className="flex gap-1">
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-sm font-bold">
                  {String(timeLeft.hours).padStart(2, "0")}h
                </span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-sm font-bold">
                  {String(timeLeft.minutes).padStart(2, "0")}m
                </span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-sm font-bold">
                  {String(timeLeft.seconds).padStart(2, "0")}s
                </span>
              </div>
              <span className="text-sm">⚡</span>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 px-4 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3 p-2 border rounded-lg bg-card">
                      <div className="w-16 h-16 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img 
                            src={item.product.node.images.edges[0].node.url} 
                            alt={item.product.node.title} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm">{item.product.node.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.selectedOptions.map(option => option.value).join(' • ')}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-emerald-600 font-medium">In Stock</span>
                        </div>
                        <p className="font-semibold text-sm mt-1">${parseFloat(item.price.amount).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => removeItem(item.variantId)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex-shrink-0 space-y-3 pt-3 border-t bg-background">
                {/* Savings Banner */}
                {totalSavings > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg py-2 px-3 flex items-center justify-center gap-2">
                    <span className="text-lg">🔥</span>
                    <span className="text-amber-700 font-bold text-sm">
                      You Save: ${totalSavings.toFixed(2)}!
                    </span>
                    <span className="text-lg">🔥</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                </div>

                {/* Secure Checkout Button */}
                <Button 
                  onClick={handleCheckout} 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 text-base font-bold shadow-lg shadow-orange-500/30" 
                  size="lg" 
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      🔒 SECURE CHECKOUT
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Powered by Shopify • 256-bit SSL Encryption
                </p>

                <div className="flex justify-center">
                  <img 
                    src={paymentBadges} 
                    alt="Accepted payment methods: Visa, Mastercard, American Express, PayPal, Apple Pay" 
                    className="h-8 object-contain"
                  />
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center text-center p-2 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center mb-1">
                      <Lock className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="text-[10px] font-medium">Secure</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-medium">FREE Shipping 🇨🇦</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
                      <RotateCcw className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-medium">30-Day Return</span>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground pb-2">
                  ⚡ Free Shipping Across Canada 🇨🇦 • 30-Day Money-Back Guarantee
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
