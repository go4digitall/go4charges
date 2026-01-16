import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, ArrowRight } from "lucide-react";

export const CTASection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="pt-8 pb-12 md:py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--glow-blue)/0.2),transparent_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Badge className="mb-6 px-6 py-2 text-lg bg-secondary glow-pink animate-pulse-glow">
          <Timer className="w-5 h-5 mr-2" />
          Last Chance - Offer Ends Tonight!
        </Badge>

        <h2 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 px-2">
          Don't Miss Out On <br className="hidden md:block" />
          <span className="text-gradient">This Deal</span>
        </h2>

        <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Join 1,000+ happy customers who've upgraded to the ChargeStand™.
          Limited stock remaining at this price.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            size="lg"
            className="text-xl px-10 py-7 bg-primary hover:bg-primary/90 glow-yellow hover-glow"
            onClick={scrollToProducts}
          >
            Get ChargeStand™ Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          ✓ 30-Day Money-Back Guarantee • ✓ FREE Worldwide Shipping • ✓ Safe & Secure Checkout
        </p>

        <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border glow-border max-w-md mx-auto">
          <p className="text-accent font-semibold text-lg mb-2">
            ⚡ URGENT: Limited stock available!
          </p>
          <p className="text-sm text-muted-foreground">
            Once they're gone, prices return to normal. Don't miss out on 50% savings.
          </p>
        </div>
      </div>
    </section>
  );
};
