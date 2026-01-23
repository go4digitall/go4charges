import benefitsBanner from "@/assets/benefits-banner.jpg";
import benefitsVideo from "@/assets/benefits-video.mp4";
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

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-center">
          {/* Main banner image - takes 3 columns on large screens */}
          <div className="lg:col-span-3">
            <img 
              src={benefitsBanner} 
              alt="Go4Charges - Up to 240W Fast Charging, 90° Anti-Break Design, Integrated Phone Stand, Reinforced Braided Cable" 
              className="w-full rounded-xl shadow-lg"
            />
          </div>
          
          {/* Video showcase 1 */}
          <div className="lg:col-span-1.5">
            <div className="relative rounded-xl overflow-hidden shadow-lg glow-primary aspect-[3/4]">
              <video 
                src={benefitsVideo}
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none rounded-xl" />
            </div>
          </div>

          {/* Video showcase 2 */}
          <div className="lg:col-span-1.5">
            <div className="relative rounded-xl overflow-hidden shadow-lg glow-primary aspect-[3/4]">
              <video 
                src={benefitsVideo2}
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none rounded-xl" />
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-sm text-muted-foreground mt-4 italic">
          See it in action
        </p>
      </div>
    </section>
  );
};
