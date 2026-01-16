import { Zap, Battery, Cable } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-16 md:py-24">
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Charge ultra-rapide 240W
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Câbles de charge{" "}
            <span className="text-primary">nouvelle génération</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez notre gamme de câbles de charge ultra-rapides avec connecteur 90° 
            pour une expérience de charge optimale.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              <span>Charge 240W</span>
            </div>
            <div className="flex items-center gap-2">
              <Cable className="h-5 w-5 text-primary" />
              <span>Connecteur 90°</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Compatible universel</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-x-1/2" />
    </section>
  );
};
