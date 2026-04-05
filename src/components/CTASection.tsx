import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, ArrowRight, Gift } from "lucide-react";

export const CTASection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-8 pb-12 md:py-20 px-4 relative overflow-hidden bg-foreground text-white">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Badge className="mb-6 px-6 py-2 text-lg bg-primary hover:bg-primary/90 text-white border-0">
          <Timer className="w-5 h-5 mr-2" />
          Last Chance — Limited Offer!
        </Badge>

        <h2 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 px-2">
          Don't Miss Out On <br className="hidden md:block" />
          <span className="text-primary">These Crazy Prices</span>
        </h2>

        <p className="text-base md:text-xl text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Join 1,000+ happy customers! Very limited stock at these insane prices.
        </p>

        {/* Free Charger Highlight */}
        <div className="mb-6 border border-white/20 bg-white/10 py-3 px-6 rounded-xl max-w-md mx-auto flex items-center justify-center gap-2">
          <Gift className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">🎁 FREE Wall Charger with Family Pack!</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            size="lg"
            className="text-xl px-10 py-7 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 animate-bounce font-bold"
            onClick={scrollToProducts}
          >
            Grab The Deal Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-white/60">
          ✓ 30-Day Money-Back Guarantee • 
          ✓ FREE Shipping to Canada 🇨🇦 • 
          ✓ Safe & Secure Checkout
        </p>

        <div className="mt-8 p-6 bg-white/10 rounded-lg border border-white/20 max-w-md mx-auto">
          <p className="text-primary font-bold text-xl mb-2">
            ⚡ UP TO 70% OFF!
          </p>
          <p className="text-sm text-white/60 font-medium">
            Extremely limited stock. These prices won't last. Order now!
          </p>
        </div>
      </div>
    </section>
  );
};
