import { Button } from "@/components/ui/button";
import { ShieldCheck, Truck, RotateCcw, Headphones, Star, CreditCard } from "lucide-react";
import heroImage from "@/assets/hero-image.png";

export const HeroSection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section className="flex flex-col">
      {/* Hero Image - Full Width */}
      <div className="w-full aspect-[4/3] md:aspect-auto overflow-hidden">
        <img 
          src={heroImage} 
          alt="ChargeStand Up to 240W Cable" 
          width={1376}
          height={768}
          className="w-full h-full object-cover md:h-auto md:object-contain" 
        />
      </div>

      {/* Content Below Image */}
      <div className="bg-background py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          {/* PROMO BANNER - Above the fold */}
          <div className="mb-6 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white py-4 px-6 rounded-2xl shadow-xl shadow-red-500/30 max-w-xl mx-auto animate-pulse">
            <div className="text-2xl md:text-3xl font-black mb-1">
              🔥 UP TO 73% OFF 🔥
            </div>
            <div className="text-sm md:text-base font-medium opacity-95">
              Limited Time Only • While Supplies Last
            </div>
          </div>

          {/* Trustpilot-style Rating */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-7 h-7 bg-[#00b67a] flex items-center justify-center">
                  <Star className="w-4 h-4 fill-white text-white" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-foreground">Excellent</span>
              <span className="text-xs text-muted-foreground">4.9 out of 5 • 1,000+ reviews</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto">
            Up to 240W Ultra-Fast Charging • 90° Design • Universal USB-C Compatibility
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/40 font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 animate-bounce" 
              onClick={scrollToProducts}
            >
              🛒 Shop Now - Up to 73% OFF
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-7 border-2 border-foreground/20 bg-white/90 text-foreground hover:bg-foreground hover:text-background font-bold tracking-wide transition-all duration-300 hover:scale-105" 
              onClick={scrollToProducts}
            >
              See Products →
            </Button>
          </div>

          {/* Price Preview */}
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-4">
            <div className="bg-white border-2 border-red-200 rounded-lg px-2 py-2 shadow-md text-center">
              <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">1x Cable</div>
              <div className="text-[10px] text-muted-foreground line-through">$49.90</div>
              <div className="text-base font-bold text-red-600">$19.90</div>
              <div className="text-[10px] font-bold text-red-500">-60%</div>
            </div>
            <div className="bg-amber-50 border-2 border-amber-400 rounded-lg px-2 py-2 shadow-md text-center relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">BEST SELLER</div>
              <div className="text-[10px] font-semibold text-muted-foreground mb-0.5 mt-1">Duo Pack</div>
              <div className="text-[10px] text-muted-foreground line-through">$99.80</div>
              <div className="text-base font-bold text-amber-600">$29.90</div>
              <div className="text-[10px] font-bold text-amber-500">-70%</div>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg px-2 py-2 shadow-md text-center relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">BEST VALUE</div>
              <div className="text-[10px] font-semibold text-muted-foreground mb-0.5 mt-1">Family Pack</div>
              <div className="text-[10px] text-muted-foreground line-through">$149.70</div>
              <div className="text-base font-bold text-emerald-600">$39.90</div>
              <div className="text-[10px] font-bold text-emerald-500">-73%</div>
            </div>
          </div>
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
              <p className="text-xs md:text-base font-medium">Free Shipping</p>
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
