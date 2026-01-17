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
    <section className="py-8 px-4 bg-section-alt">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${badge.bgColor} flex items-center justify-center mb-2 transition-all duration-300 ${badge.hoverBg} group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${badge.color}`} />
                </div>
                <h3 className="font-semibold text-foreground text-xs md:text-sm mb-1">
                  {badge.title}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground">
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
