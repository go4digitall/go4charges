import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, ArrowRight } from "lucide-react";

export const CTASection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-8 pb-12 md:py-20 px-4 relative overflow-hidden bg-primary/5">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Badge className="mb-6 px-6 py-2 text-lg bg-red-500 hover:bg-red-600 text-white border-0 animate-pulse">
          <Timer className="w-5 h-5 mr-2" />
          Last Chance - Limited Offer!
        </Badge>

        <h2 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 px-2">
          Don't Miss Out On <br className="hidden md:block" />
          <span className="text-gradient">These Crazy Prices</span>
        </h2>

        <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Join 1,000+ happy customers! Very limited stock at these insane prices.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            size="lg"
            className="text-xl px-10 py-7 bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30 animate-bounce"
            onClick={scrollToProducts}
          >
            Grab The Deal Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="text-emerald-600">✓</span> 30-Day Money-Back Guarantee • 
          <span className="text-blue-600"> ✓</span> FREE Worldwide Shipping • 
          <span className="text-violet-600"> ✓</span> Safe & Secure Checkout
        </p>

        <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border-2 border-red-200 max-w-md mx-auto">
          <p className="text-red-600 font-bold text-xl mb-2">
            ⚡ UP TO 73% OFF!
          </p>
          <p className="text-sm text-red-500 font-medium">
            Extremely limited stock. These prices won't last. Order now!
          </p>
        </div>
      </div>
    </section>
  );
};
