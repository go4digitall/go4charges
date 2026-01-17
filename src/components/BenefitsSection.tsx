import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Cable, Timer } from "lucide-react";

const benefits = [
  {
    title: "240W Ultra-Fast",
    description: "Charge your laptop from 0-50% in just 30 minutes",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-100"
  },
  {
    title: "90° Design",
    description: "Reduces stress on cable connection, lasts 10x longer",
    icon: Cable,
    color: "text-blue-500",
    bgColor: "bg-blue-100"
  },
  {
    title: "Premium Build",
    description: "Braided nylon construction with reinforced connectors",
    icon: Shield,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100"
  },
  {
    title: "Universal",
    description: "Works with all USB-C devices - laptops, phones, tablets",
    icon: Timer,
    color: "text-violet-500",
    bgColor: "bg-violet-100"
  }
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="pt-8 pb-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
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
              <Card key={index} className="border border-border hover:shadow-md transition-shadow bg-card">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${benefit.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${benefit.color}`} />
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
