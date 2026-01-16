import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Users, Sparkles, Check } from "lucide-react";

const bundles = [
  {
    id: "duo",
    title: "Pack Duo",
    subtitle: "2 câbles ChargeStand™",
    price: 39.90,
    originalPrice: 59.80,
    savings: "33%",
    color: "bg-blue-500",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    icon: Package,
    features: ["2x ChargeStand™ 240W", "Livraison gratuite", "Garantie 30 jours"],
    popular: false
  },
  {
    id: "family",
    title: "Pack Famille",
    subtitle: "3 câbles ChargeStand™",
    price: 54.90,
    originalPrice: 89.70,
    savings: "39%",
    color: "bg-amber-500",
    borderColor: "border-amber-300",
    bgColor: "bg-amber-50",
    icon: Users,
    features: ["3x ChargeStand™ 240W", "Livraison gratuite", "Garantie 30 jours", "Meilleur rapport qualité-prix"],
    popular: true
  }
];

export const BundleSection = () => {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-amber-500 hover:bg-amber-600 text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            Offres Spéciales
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Équipez toute la <span className="text-gradient">maison</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Profitez de nos packs et économisez jusqu'à 39% sur vos câbles ChargeStand™
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {bundles.map((bundle) => {
            const Icon = bundle.icon;
            return (
              <div
                key={bundle.id}
                className={`relative rounded-2xl border-2 ${bundle.borderColor} ${bundle.bgColor} p-6 md:p-8 transition-all hover:shadow-lg ${bundle.popular ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
              >
                {bundle.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500 text-white border-0 shadow-md">
                      ⭐ Le plus populaire
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full ${bundle.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{bundle.title}</h3>
                    <p className="text-sm text-muted-foreground">{bundle.subtitle}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{bundle.price.toFixed(2)}€</span>
                    <span className="text-lg text-muted-foreground line-through">{bundle.originalPrice.toFixed(2)}€</span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                      -{bundle.savings}
                    </Badge>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {bundle.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${bundle.popular ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/90'}`}
                  size="lg"
                  onClick={scrollToProducts}
                >
                  Choisir ce pack
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
