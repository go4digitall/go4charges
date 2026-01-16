import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Cable, Timer } from "lucide-react";

const benefits = [
  {
    title: "240W Ultra-Fast",
    description: "Charge your laptop from 0-50% in just 30 minutes",
    icon: Zap
  },
  {
    title: "90° Design",
    description: "Reduces stress on cable connection, lasts 10x longer",
    icon: Cable
  },
  {
    title: "Premium Build",
    description: "Braided nylon construction with reinforced connectors",
    icon: Shield
  },
  {
    title: "Universal",
    description: "Works with all USB-C devices - laptops, phones, tablets",
    icon: Timer
  }
];

export const BenefitsSection = () => {
  return (
    <section className="pt-8 pb-12 md:py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--glow-blue)/0.1),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 px-2">
            Why Choose <span className="text-gradient">ChargeStand™</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Built for performance, designed for durability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="glow-border hover-glow bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
