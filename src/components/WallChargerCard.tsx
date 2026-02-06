import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Gift, ArrowRight, Plug, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import wallChargerImage from "@/assets/wall-charger-240w.webp";

export const WallChargerCard = () => {
  // Deterministic stock level for wall charger
  const stockLevel = 7;
  const stockPercentage = (stockLevel / 15) * 100;
  const isLowStock = stockLevel < 5;
  const isMediumStock = stockLevel >= 5 && stockLevel < 10;

  return (
    <Link to="/product/wall-charger-240w-gan" className="block h-full">
      <Card className="group overflow-hidden transition-all duration-300 bg-card backdrop-blur border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 relative h-full flex flex-col">
        {/* FREE Banner */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold py-2 px-2 text-center flex items-center justify-center gap-1.5 rounded-t-lg">
            <Gift className="h-3.5 w-3.5" />
            <span>FREE WITH FAMILY PACK!</span>
            <Gift className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Power Badge */}
        <div className="absolute top-10 right-3 z-10">
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
            <Zap className="h-3 w-3 mr-1" />
            240W
          </Badge>
        </div>

        {/* Stock Level Indicator */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-emerald-200 px-3 py-2 z-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className={`h-3 w-3 ${isLowStock ? 'text-red-500' : isMediumStock ? 'text-orange-500' : 'text-green-500'}`} />
            <span className={`text-xs font-semibold ${isLowStock ? 'text-red-600' : isMediumStock ? 'text-orange-600' : 'text-green-600'}`}>
              Only {stockLevel} left in stock!
            </span>
          </div>
          <Progress 
            value={stockPercentage} 
            className={`h-1.5 ${isLowStock ? '[&>div]:bg-red-500' : isMediumStock ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
          />
        </div>

        <div className="aspect-square overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
          <img
            src={wallChargerImage}
            alt="Wall Charger 240W GaN"
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <CardContent className="p-4 pb-10 bg-gradient-to-b from-emerald-50/50 to-transparent flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Plug className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-sm text-foreground group-hover:text-emerald-600 transition-colors">
              Wall Charger 240W GaN
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
            5 Ports • 3x USB-C PD + 2x USB-A QC3.0 • GaN Technology
          </p>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-emerald-600">FREE</span>
                <span className="text-sm text-muted-foreground line-through">$19.90</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">with Family Pack</span>
            </div>
            <Button 
              size="sm" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
            >
              Get Free
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
