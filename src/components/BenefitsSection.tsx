import benefitsBanner from "@/assets/benefits-banner.jpg";

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="pt-8 pb-12 md:py-20 px-4 bg-background scroll-mt-40 md:scroll-mt-36">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 px-2">
            Why Choose <span className="text-gradient">ChargeStand™</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Built for performance, designed for durability
          </p>
        </div>

        <img 
          src={benefitsBanner} 
          alt="Go4Charges - Up to 240W Fast Charging, 90° Anti-Break Design, Integrated Phone Stand, Reinforced Braided Cable" 
          className="w-full max-w-4xl mx-auto rounded-xl shadow-lg"
        />
      </div>
    </section>
  );
};
