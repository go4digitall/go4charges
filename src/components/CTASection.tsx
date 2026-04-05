import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, ArrowRight, Gift } from "lucide-react";

export const CTASection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-8 pb-12 md:py-20 px-4 relative overflow-hidden bg-card">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Badge className="mb-6 px-6 py-2 text-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 animate-pulse">
          <Timer className="w-5 h-5 mr-2" />
          Last Chance — Limited Offer!
        </Badge>

        <h2 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 px-2 text-foreground">
          Don't Miss Out On <br className="hidden md:block" />
          <span className="text-gradient">These Crazy Prices</span>
        </h2>

        <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Join 1,000+ happy customers! Very limited stock at these insane prices.
        </p>

        {/* Free Charger Highlight */}
        <div className="mb-6 border border-primary/30 bg-primary/10 text-foreground py-3 px-6 rounded-xl max-w-md mx-auto flex items-center justify-center gap-2">
          <Gift className="w-5 h-5 flex-shrink-0 text-primary" />
          <span className="font-bold">🎁 FREE Wall Charger with Family Pack!</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            size="lg"
            className="text-xl px-10 py-7 bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/20 animate-bounce font-bold"
            onClick={scrollToProducts}
          >
            Grab The Deal Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="text-primary">✓</span> 30-Day Money-Back Guarantee • 
          <span className="text-primary"> ✓</span> FREE Shipping to Canada 🇨🇦 • 
          <span className="text-primary"> ✓</span> Safe & Secure Checkout
        </p>

        <div className="mt-8 p-6 bg-muted rounded-lg border border-border max-w-md mx-auto">
          <p className="text-primary font-bold text-xl mb-2">
            ⚡ UP TO 70% OFF!
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Extremely limited stock. These prices won't last. Order now!
          </p>
        </div>
      </div>
    </section>
  );
};
