import { ShieldCheck, Lock, Truck, Headphones } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "30-Day Money-Back",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    icon: Lock,
    title: "Secure Checkout",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  {
    icon: Truck,
    title: "FREE Shipping",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  }
];

export const TrustBadgeSection = () => {
  return (
    <div className="bg-muted/50 border-y border-border py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-4 md:gap-10 max-w-5xl mx-auto">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${badge.bgColor} flex items-center justify-center mb-1 md:mb-2 transition-all duration-300 group-hover:scale-110`}>
                  <Icon className={`w-4 h-4 md:w-6 md:h-6 ${badge.color}`} />
                </div>
                <p className="text-[10px] md:text-sm font-medium">
                  {badge.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
