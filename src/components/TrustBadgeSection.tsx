import { ShieldCheck, Lock, Truck, Headphones } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "30-Day Money-Back",
    description: "100% satisfaction guaranteed or your money back",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    hoverBg: "group-hover:bg-emerald-200"
  },
  {
    icon: Lock,
    title: "Secure Checkout",
    description: "SSL encrypted payment processing",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
    hoverBg: "group-hover:bg-violet-200"
  },
  {
    icon: Truck,
    title: "FREE Shipping",
    description: "Worldwide shipping on all orders",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    hoverBg: "group-hover:bg-blue-200"
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description: "Available every day to help you",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    hoverBg: "group-hover:bg-amber-200"
  }
];

export const TrustBadgeSection = () => {
  return (
    <section className="py-12 px-4 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 rounded-full ${badge.bgColor} flex items-center justify-center mb-4 transition-all duration-300 ${badge.hoverBg} group-hover:scale-110`}>
                  <Icon className={`w-8 h-8 ${badge.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
