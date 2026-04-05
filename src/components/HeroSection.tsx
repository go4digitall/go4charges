import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, RotateCcw, Headphones, Star, CreditCard, ChevronDown, Loader2, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroVideo from "@/assets/benefits-video.mp4";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isAddingCharger, setIsAddingCharger] = useState(false);
  const { addItem, setIsOpen } = useCartStore();

  const { data: chargerProduct } = useQuery({
    queryKey: ['wall-charger-hero'],
    queryFn: () => fetchProductByHandle('wall-charger-240w-gan'),
    staleTime: 1000 * 60 * 5,
  });

  const handleAddChargerToCart = async () => {
    if (!chargerProduct || isAddingCharger) return;
    const variant = chargerProduct.variants?.edges?.[0]?.node;
    if (!variant) return;

    setIsAddingCharger(true);
    try {
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
        value: 24.90,
        currency: variant.price.currencyCode,
      });
      trackAnalyticsEvent('add_to_cart', {
        product_name: chargerProduct.title,
        price: 24.90,
        variant_id: variant.id,
        source: 'hero_wall_charger'
      });
      setIsOpen(true);
    } finally {
      setIsAddingCharger(false);
    }
  };

  const goToFamilyBundle = () => {
    console.log('[Click] Shop Flash Sale CTA clicked - navigating to Family Pack');
    navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=family");
  };

  return (
    <section className="flex flex-col">
      {/* FLASH SALE BANNER - Above Hero Image */}
      <div className="w-full bg-gradient-to-b from-amber-50 to-orange-50 pt-2 md:pt-6 pb-1 md:pb-2">
        <div className="container mx-auto px-4 text-center">
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-2 md:py-4 px-4 md:px-6 rounded-lg md:rounded-xl shadow-lg shadow-orange-500/30 max-w-lg mx-auto">
            <div className="text-[10px] md:text-sm font-semibold tracking-wider mb-0.5 md:mb-1 text-amber-100">
              ⚡ FLASH SALE ⚡
            </div>
            <div className="text-lg md:text-3xl font-black tracking-tight">
              UP TO 70% OFF
            </div>
            <div className="text-[10px] md:text-sm font-medium mt-0.5 md:mt-1 text-orange-100">
              Limited Time Only • While Supplies Last
            </div>
          </div>

          {/* FREE Charger with Family Pack - Prominent Banner */}
          <div className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-4 rounded-lg max-w-lg mx-auto flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20">
            <Gift className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="text-xs md:text-sm font-bold">FREE Wall Charger ($49.90 value) with every Family Pack!</span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full bg-gradient-to-b from-orange-50 to-white py-2 md:py-6 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="relative group">
            <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-2xl shadow-primary/30 ring-1 ring-primary/10">
              <video 
                src={heroVideo}
                autoPlay 
                loop 
                muted 
                playsInline
                preload="auto"
                className="w-full h-auto object-contain transition-all duration-700 group-hover:scale-[1.02] animate-fade-in contrast-[1.05] saturate-[1.1]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)] pointer-events-none" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-orange-500/15 to-red-500/20 rounded-3xl blur-2xl -z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          </div>
        </div>
      </div>

      {/* Content Below Image */}
      <div className="bg-background py-4 md:py-10">
        <div className="container mx-auto px-4 text-center">
          {/* Trustpilot-style Rating */}
          <div className="flex flex-col items-center gap-1.5 mb-5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-[#00b67a] flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-foreground">Excellent</span>
              <span className="text-xs text-muted-foreground">4.9 out of 5 • 1,000+ reviews</span>
            </div>
          </div>

          {/* CTA - Single prominent button */}
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-12 py-6 md:py-7 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-500/40 font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 mb-3 w-full sm:w-auto" 
            onClick={goToFamilyBundle}
          >
            ⚡ Shop Now - 70% OFF
          </Button>

          {/* Animated arrow pointing down */}
          <div className="flex justify-center mb-4">
            <button 
              onClick={goToFamilyBundle}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
              aria-label="Go to Family Pack"
            >
              <ChevronDown className="h-8 w-8 text-primary animate-bounce" />
            </button>
          </div>

          {/* Price Preview - Family Pack first and highlighted */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-lg mx-auto mb-3">
            {/* Family Pack - Most Prominent */}
            <button 
              onClick={() => {
                console.log('[Click] Hero Price Preview: Family Pack');
                navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=family");
              }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-lg px-2 py-2 shadow-lg shadow-amber-500/20 text-center relative hover:scale-105 hover:shadow-xl hover:border-amber-500 transition-all duration-200 cursor-pointer ring-2 ring-amber-400/30"
            >
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md animate-pulse">🏆 BEST VALUE</div>
              <div className="text-[10px] font-bold text-amber-700 mb-0.5 mt-1">Family Pack</div>
              <div className="text-[9px] font-semibold text-amber-600 -mt-0.5 mb-0.5">3x Cables</div>
              <div className="text-[10px] text-muted-foreground line-through">$149.70</div>
              <div className="text-lg font-black text-amber-600">$44.90</div>
              <div className="text-[10px] font-bold text-amber-500 bg-amber-100 rounded px-1">-70%</div>
              <div className="text-[8px] font-bold text-emerald-600 mt-0.5">+ FREE Charger 🎁</div>
            </button>
            {/* Duo Pack */}
            <button 
              onClick={() => {
                console.log('[Click] Hero Price Preview: Duo Pack');
                navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=duo");
              }}
              className="bg-orange-50 border-2 border-orange-300 rounded-lg px-2 py-2 shadow-md text-center relative hover:scale-105 hover:shadow-lg hover:border-orange-400 transition-all duration-200 cursor-pointer"
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">POPULAR</div>
              <div className="text-[10px] font-semibold text-muted-foreground mb-0.5 mt-1">Duo Pack</div>
              <div className="text-[9px] font-medium text-orange-600 -mt-0.5 mb-0.5">2x Cables</div>
              <div className="text-[10px] text-muted-foreground line-through">$99.80</div>
              <div className="text-base font-bold text-orange-600">$34.90</div>
              <div className="text-[10px] font-bold text-orange-500">-65%</div>
            </button>
            {/* Single Cable */}
            <button 
              onClick={() => {
                console.log('[Click] Hero Price Preview: Single Cable');
                navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=single");
              }}
              className="bg-white border-2 border-gray-200 rounded-lg px-2 py-2 shadow-md text-center hover:scale-105 hover:shadow-lg hover:border-gray-400 transition-all duration-200 cursor-pointer"
            >
              <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">1x Cable</div>
              <div className="text-[10px] text-muted-foreground line-through">$49.90</div>
              <div className="text-base font-bold text-foreground">$24.90</div>
              <div className="text-[10px] font-bold text-orange-500">-50%</div>
            </button>
            {/* Wall Charger - Add to Cart */}
            <button 
              onClick={handleAddChargerToCart}
              disabled={isAddingCharger}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-lg px-2 py-2 shadow-md text-center relative hover:scale-105 hover:shadow-lg hover:border-emerald-400 transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">⚡ NEW</div>
              <div className="text-[10px] font-semibold text-emerald-700 mb-0.5 mt-1">Wall Charger</div>
              <div className="text-[9px] font-medium text-emerald-600 -mt-0.5 mb-0.5">240W GaN</div>
              <div className="text-[10px] text-muted-foreground line-through">$49.90</div>
              <div className="text-base font-bold text-emerald-600">
                {isAddingCharger ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "$24.90"}
              </div>
              <div className="text-[10px] font-bold text-emerald-500">-50%</div>
            </button>
          </div>

          {/* Lightning variant link */}
          <button
            onClick={() => {
              console.log('[Click] Hero: Lightning variant link clicked');
              navigate("/product/chargestand-240w-90-fast-charging-cable?type=lightning&bundle=family");
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 px-5 py-2.5 rounded-full shadow-lg shadow-gray-900/30 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span>Also available for <strong>iPhone 5-14 (Lightning)</strong></span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Trust Badges - Single Row */}
      <div className="bg-muted/50 border-y border-border py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center group">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-300 group-hover:scale-110">
                <CreditCard className="w-5 h-5 md:w-7 md:h-7 text-emerald-600" />
              </div>
              <p className="text-xs md:text-base font-medium">Secure Payments</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-300 group-hover:scale-110">
                <Truck className="w-5 h-5 md:w-7 md:h-7 text-blue-600" />
              </div>
              <p className="text-xs md:text-base font-medium">Free Shipping 🇨🇦</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-violet-100 flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-300 group-hover:scale-110">
                <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-violet-600" />
              </div>
              <p className="text-xs md:text-base font-medium">30-Day Guarantee</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-amber-100 flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-300 group-hover:scale-110">
                <RotateCcw className="w-5 h-5 md:w-7 md:h-7 text-amber-600" />
              </div>
              <p className="text-xs md:text-base font-medium">Easy Returns</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-rose-100 flex items-center justify-center mb-1.5 md:mb-2 transition-all duration-300 group-hover:scale-110">
                <Headphones className="w-5 h-5 md:w-7 md:h-7 text-rose-600" />
              </div>
              <p className="text-xs md:text-base font-medium">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
