import { Link } from "react-router-dom";
import { Gift, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import wallChargerImage from "@/assets/wall-charger-240w.webp";

export const FreeChargerBanner = () => {
  return (
    <section className="py-6 md:py-8 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-2 left-[5%] text-white/20 text-2xl pointer-events-none">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="absolute bottom-2 right-[8%] text-white/15 text-xl pointer-events-none">
        <Gift className="h-5 w-5" />
      </div>
      <div className="absolute top-1/2 left-[15%] -translate-y-1/2 text-white/10 pointer-events-none hidden md:block">
        <Zap className="h-12 w-12" />
      </div>
      <div className="absolute top-1/2 right-[12%] -translate-y-1/2 text-white/10 pointer-events-none hidden md:block">
        <Zap className="h-10 w-10" />
      </div>
      
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Charger Image */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white/20 backdrop-blur-sm p-2 flex-shrink-0 shadow-lg shadow-emerald-700/30">
            <img
              src={wallChargerImage}
              alt="Wall Charger 240W GaN"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          {/* Text Content */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <Gift className="h-5 w-5 text-white animate-bounce" />
              <span className="text-white font-bold text-lg md:text-xl uppercase tracking-wide">
                Free Gift with Family Pack!
              </span>
              <Gift className="h-5 w-5 text-white animate-bounce" />
            </div>
            <p className="text-white/90 text-sm md:text-base">
              Get a <span className="font-bold">240W Wall Charger</span> (value $19.90) <span className="font-bold underline decoration-2">absolutely FREE</span> when you order the Family Pack
            </p>
          </div>
          
          {/* CTA Button */}
          <Link to="/product/chargestand-240w-90-fast-charging-cable?bundle=family" className="flex-shrink-0">
            <Button 
              size="lg"
              className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-lg shadow-emerald-700/30 hover:shadow-xl transition-all duration-300 group"
            >
              <span>Claim Free Gift</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
