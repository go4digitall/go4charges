import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ShieldCheck, Truck, RotateCcw, Headphones, Star, Zap } from "lucide-react";

export const HeroSection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative md:min-h-screen flex items-start md:items-center justify-center overflow-hidden pt-3 pb-3 md:py-20 px-4">
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight px-2">
          <span className="block mb-1 md:mb-2">The Charging Cable</span>
          <span className="text-gradient">That Powers Everything</span>
        </h1>

        {/* Hero Image Placeholder */}
        <div className="mt-4 mb-4 md:mt-6 md:mb-6 w-full max-w-3xl lg:max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 aspect-video flex items-center justify-center border border-border">
          <div className="text-center p-8">
            <Zap className="w-20 h-20 mx-auto text-primary mb-4" />
            <p className="text-lg text-muted-foreground">ChargeStand™ – 240W 90° Fast Charging</p>
          </div>
        </div>

        {/* Subheadline */}
        <p className="text-base md:text-2xl text-muted-foreground mb-6 md:mb-10 max-w-3xl mx-auto px-4">
          240W Ultra-Fast Charging • 90° Design • Universal Compatibility
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Badge variant="outline" className="px-4 py-2 bg-background border-emerald-200 text-emerald-700">
            <Gift className="w-4 h-4 mr-2 text-emerald-500" />
            FREE Shipping Worldwide
          </Badge>
          <Badge variant="outline" className="px-4 py-2 bg-background border-border flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-[#00b67a] rounded flex items-center justify-center">
                  <Star className="w-4 h-4 fill-white text-white" />
                </div>
              ))}
            </div>
            <span className="ml-1">4.9/5 from 1,000+ customers</span>
          </Badge>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            onClick={scrollToProducts}
          >
            Shop Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 bg-background hover:bg-muted"
            onClick={scrollToProducts}
          >
            See Products
          </Button>
        </div>

        {/* Trust Badges Grid */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-emerald-200 group-hover:scale-110">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-foreground">Secure Payments</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-blue-200 group-hover:scale-110">
              <Truck className="w-7 h-7 text-blue-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-foreground">Free Shipping</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-amber-200 group-hover:scale-110">
              <RotateCcw className="w-7 h-7 text-amber-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-foreground">Money-Back Guarantee</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mb-3 transition-all duration-300 group-hover:bg-violet-200 group-hover:scale-110">
              <Headphones className="w-7 h-7 text-violet-600" />
            </div>
            <p className="text-xs md:text-sm font-medium text-foreground">24/7 Support</p>
          </div>
        </div>

        {/* Scarcity Message */}
        <p className="text-sm text-amber-600 font-medium">
          ⚡ Limited stock available at this price!
        </p>
      </div>
    </section>
  );
};
