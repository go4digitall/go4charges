import heroImage from "@/assets/hero-before-after.jpg";
import adsHero from "@/assets/ads-hero.jpg";
import adsFeatures from "@/assets/ads-features.jpg";
import benefitsVideo2 from "@/assets/benefits-video-2.mp4";

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="pt-8 pb-12 md:py-20 px-4 bg-background scroll-mt-56 md:scroll-mt-36">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 px-2">
            Why Choose <span className="text-gradient">ChargeStand™</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Built for performance, designed for durability
          </p>
        </div>

        {/* Grid: 2 images top, 1 image + 1 video bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Top left — Charge Smarter ad */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={adsHero}
              alt="Charge Smarter. Use Your Phone. Up to 240W Fast Charging, Hands-Free, Built to Last"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top right — Features breakdown */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={adsFeatures}
              alt="Go4Charges features: 240W Fast Charging, 90° Anti-Break Design, Integrated Phone Stand, Reinforced Braided Cable"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom left — Before/After */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={heroImage}
              alt="ChargeStand - Still charging like this? Charge smarter with built-in phone stand"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bottom right — Video */}
          <div className="relative rounded-xl overflow-hidden shadow-lg glow-primary">
            <video
              src={benefitsVideo2}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4 italic">
          See it in action
        </p>
      </div>
    </section>
  );
};
