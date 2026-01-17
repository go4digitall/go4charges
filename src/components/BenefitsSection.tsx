import benefitsBanner from "@/assets/benefits-banner.jpg";

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <img 
          src={benefitsBanner} 
          alt="Go4Charges - Up to 240W Fast Charging, 90° Anti-Break Design, Integrated Phone Stand, Reinforced Braided Cable" 
          className="w-full max-w-4xl mx-auto rounded-xl shadow-lg"
        />
      </div>
    </section>
  );
};
