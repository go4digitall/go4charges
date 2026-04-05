import { ShieldCheck, Lock, Truck, Headphones } from "lucide-react";

const badges = [
  { icon: ShieldCheck, title: "30-Day Money-Back" },
  { icon: Lock, title: "Secure Checkout" },
  { icon: Truck, title: "FREE Shipping 🇨🇦" },
  { icon: Headphones, title: "24/7 Support" },
];

export const TrustBadgeSection = () => {
  return (
    <div className="bg-secondary border-y border-border py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-4 md:gap-10 max-w-5xl mx-auto">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1 md:mb-2 transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-4 h-4 md:w-6 md:h-6 text-primary" />
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
