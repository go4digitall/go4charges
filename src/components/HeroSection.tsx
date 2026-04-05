import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, RotateCcw, Headphones, Star, CreditCard, Loader2, Gift, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroVideo from "@/assets/benefits-video.mp4";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";

const heroPoints = [
  "Up to 240W ultra-fast charging",
  "90° anti-break design with built-in stand",
  "Reinforced braided cable — built to last",
];

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
    navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=family");
  };

  return (
    <section className="flex flex-col">
      {/* Hero */}
      <div className="w-full relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 relative z-10">
          {/* Mobile: title first */}
          <div className="text-center lg:hidden pt-4 pb-2">
            <h1 className="text-2xl font-extrabold text-foreground leading-[1.1] mb-2">
              Charge It.{" "}
              <span className="text-primary">Stand It. Use It.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
              The cable that charges, holds your phone hands-free, and never breaks.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start items-center gap-4 lg:gap-16 pb-6 lg:py-20">

            {/* Video card */}
            <div className="flex-1 w-full max-w-md lg:max-w-lg order-1">
              <div className="relative">
                <div className="bg-foreground rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    src={heroVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full max-h-[280px] lg:max-h-[500px] object-cover"
                  />
                  <div className="flex items-start gap-3 bg-foreground/95 p-3 lg:p-4">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs lg:text-sm font-bold text-primary">
                      JL
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-[11px] lg:text-xs text-white/90 leading-relaxed">
                        "Best cable I've ever owned. The stand feature is genius!"
                      </p>
                      <p className="text-[10px] text-white/50 mt-0.5">Jason L. — Verified Buyer</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                  FREE Shipping 🇨🇦
                </div>
              </div>
            </div>

            {/* Copy + packs */}
            <div className="flex-1 text-center lg:text-left max-w-2xl order-2">
              {/* Desktop title */}
              <div className="hidden lg:block">
                <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] mb-5">
                  Charge It.{" "}
                  <span className="text-primary">Stand It. Use It.</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-6 max-w-xl">
                  The cable that charges, holds your phone hands-free, and never breaks.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 mb-4 md:mb-6 items-center lg:items-start">
                {heroPoints.map((point) => (
                  <div key={point} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm md:text-base font-medium text-foreground">{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start mb-4 md:mb-5">
                <Button
                  size="lg"
                  className="text-sm md:text-lg px-8 md:px-14 py-5 md:py-7 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20"
                  onClick={goToFamilyBundle}
                >
                  ⚡ Shop Now — 70% OFF
                </Button>
              </div>

              {/* FREE Charger badge */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <div className="border border-foreground/20 bg-foreground text-white text-xs md:text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>🎁 FREE Wall Charger ($49.90) with Family Pack</span>
                </div>
              </div>

              {/* Price grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-lg mx-auto lg:mx-0">
                <button
                  onClick={() => navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=family")}
                  className="bg-primary text-primary-foreground rounded-lg px-2 py-2 shadow-lg text-center relative hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-foreground text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">🏆 BEST VALUE</div>
                  <div className="text-[10px] font-bold mb-0.5 mt-1">Family Pack</div>
                  <div className="text-[9px] font-semibold opacity-80 -mt-0.5 mb-0.5">3x Cables</div>
                  <div className="text-[10px] opacity-60 line-through">$149.70</div>
                  <div className="text-lg font-black">$44.90</div>
                  <div className="text-[10px] font-bold opacity-90">-70%</div>
                  <div className="text-[8px] font-bold opacity-80 mt-0.5">+ FREE Charger 🎁</div>
                </button>
                <button
                  onClick={() => navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=duo")}
                  className="bg-secondary border border-border rounded-lg px-2 py-2 shadow-sm text-center relative hover:scale-105 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-muted-foreground text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">POPULAR</div>
                  <div className="text-[10px] font-semibold text-muted-foreground mb-0.5 mt-1">Duo Pack</div>
                  <div className="text-[9px] font-medium text-muted-foreground -mt-0.5 mb-0.5">2x Cables</div>
                  <div className="text-[10px] text-muted-foreground line-through">$99.80</div>
                  <div className="text-base font-bold text-foreground">$34.90</div>
                  <div className="text-[10px] font-bold text-primary">-65%</div>
                </button>
                <button
                  onClick={() => navigate("/product/chargestand-240w-90-fast-charging-cable?bundle=single")}
                  className="bg-secondary border border-border rounded-lg px-2 py-2 shadow-sm text-center hover:scale-105 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">1x Cable</div>
                  <div className="text-[10px] text-muted-foreground line-through">$49.90</div>
                  <div className="text-base font-bold text-foreground">$24.90</div>
                  <div className="text-[10px] font-bold text-primary">-50%</div>
                </button>
                <button
                  onClick={handleAddChargerToCart}
                  disabled={isAddingCharger}
                  className="bg-secondary border border-border rounded-lg px-2 py-2 shadow-sm text-center relative hover:scale-105 hover:border-primary/30 transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">⚡ NEW</div>
                  <div className="text-[10px] font-semibold text-foreground mb-0.5 mt-1">Wall Charger</div>
                  <div className="text-[9px] font-medium text-muted-foreground -mt-0.5 mb-0.5">240W GaN</div>
                  <div className="text-[10px] text-muted-foreground line-through">$49.90</div>
                  <div className="text-base font-bold text-foreground">
                    {isAddingCharger ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "$24.90"}
                  </div>
                  <div className="text-[10px] font-bold text-primary">-50%</div>
                </button>
              </div>

              <button
                onClick={() => navigate("/product/chargestand-240w-90-fast-charging-cable?type=lightning&bundle=family")}
                className="mt-3 inline-flex items-center gap-2 text-xs md:text-sm font-medium text-foreground bg-secondary hover:bg-muted px-4 py-2 rounded-full shadow-sm hover:scale-105 transition-all duration-300 border border-border"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span>Also available for <strong>iPhone 5-14 (Lightning)</strong></span>
                <span className="text-muted-foreground">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rating bar */}
      <div className="bg-secondary py-4 md:py-6 border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-[#00b67a] flex items-center justify-center rounded-sm">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-foreground">Excellent</span>
              <span className="text-xs text-muted-foreground">4.9 out of 5 • 1,000+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-background border-b border-border py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 max-w-5xl mx-auto">
            {[
              { icon: CreditCard, label: "Secure Payments" },
              { icon: Truck, label: "Free Shipping 🇨🇦" },
              { icon: ShieldCheck, label: "30-Day Guarantee" },
              { icon: RotateCcw, label: "Easy Returns" },
              { icon: Headphones, label: "24/7 Support" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-center group">
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <p className="text-xs md:text-sm font-semibold text-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
