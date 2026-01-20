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
          className="w-full h-full object-cover md:h-auto md:object-contain" 
        />
      </div>

      {/* Content Below Image */}
      <div className="bg-background py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/40 font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50" 
              onClick={scrollToProducts}
            >
              🛒 Shop Now
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
