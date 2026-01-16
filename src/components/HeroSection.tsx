import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ShieldCheck, Truck, RotateCcw, Headphones, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.png";

export const HeroSection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Image Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="ChargeStand 240W Cable" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-28 lg:py-36">
        <div className="max-w-2xl">
          {/* Trust Badge */}
          <Badge variant="outline" className="mb-6 px-4 py-2 bg-background/80 backdrop-blur-sm border-emerald-200 text-emerald-700">
            <div className="flex gap-0.5 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            4.9/5 from 1,000+ customers
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            The Charging Cable{" "}
            <span className="text-gradient">That Powers Everything</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
            240W Ultra-Fast Charging • 90° Design • Universal USB-C Compatibility
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg"
              onClick={scrollToProducts}
            >
              Shop Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={scrollToProducts}
            >
              See Products
            </Button>
          </div>

          {/* Trust Badges Inline */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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

      {/* Trust Badges Grid - Below Hero */}
      <div className="relative z-10 bg-muted/50 border-y border-border py-8">
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
              <p className="text-xs md:text-sm font-medium">Money-Back Guarantee</p>
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
