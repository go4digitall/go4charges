export const AsSeenSection = () => {
  const brands = [
    { name: "WIRED", font: "font-bold tracking-tight" },
    { name: "mashable", font: "font-bold italic lowercase" },
    { name: "TechCrunch", font: "font-bold" },
    { name: "CNET", font: "font-bold tracking-wide uppercase" },
  ];

  // Double the brands for seamless loop
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="bg-background py-10 md:py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
            As Seen <span className="text-gradient">Across the Web</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Products like ChargeStand are trending on leading tech platforms and social media, including YouTube.
          </p>
        </div>
        
        <div className="relative">
          <div className="flex animate-marquee gap-12 md:gap-16">
            {duplicatedBrands.map((brand, index) => (
              <span
                key={`${brand.name}-${index}`}
                className={`text-lg md:text-xl text-muted-foreground/60 select-none whitespace-nowrap ${brand.font}`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
