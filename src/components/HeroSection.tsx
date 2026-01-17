import { Button } from "@/components/ui/button";
import { Gift, ShieldCheck, Truck, RotateCcw, Headphones, Star } from "lucide-react";
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
      <div className="w-full">
        <img 
          src={heroImage} 
          alt="ChargeStand 240W Cable" 
          className="w-full h-auto object-contain" 
        />
      </div>

      {/* Content Below Image */}
      <div className="bg-background py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          {/* Trustpilot-style Rating */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-7 h-7 bg-[#00b67a] flex items-center justify-center">
                  <Star className="w-4 h-4 fill-white text-white" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-semibold text-foreground">Excellent</span>
              <span className="text-xs text-muted-foreground">4.9 out of 5 • 1,000+ reviews</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl mx-auto">
            240W Ultra-Fast Charging • 90° Design • Universal USB-C Compatibility
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white shadow-xl shadow-emerald-500/40 font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50 animate-pulse" 
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

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-500" />
              <span>FREE Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-violet-500" />
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Grid */}
      <div className="bg-muted/50 border-y border-border py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs md:text-sm font-medium">Secure Payments</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs md:text-sm font-medium">Free Shipping</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-xs md:text-sm font-medium">Easy Returns</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110">
                <Headphones className="w-6 h-6 text-violet-600" />
              </div>
              <p className="text-xs md:text-sm font-medium">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
