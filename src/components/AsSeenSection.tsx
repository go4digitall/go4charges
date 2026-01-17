export const AsSeenSection = () => {
  const brands = [
    { name: "WIRED", font: "font-bold tracking-tight" },
    { name: "mashable", font: "font-bold italic lowercase" },
    { name: "THE VERGE", font: "font-black tracking-tighter uppercase" },
    { name: "TechCrunch", font: "font-bold" },
    { name: "CNET", font: "font-bold tracking-wide uppercase" },
  ];

  return (
    <section className="bg-background py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
            As Seen Across the Web
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Products like ChargeStand are trending on leading tech and lifestyle platforms.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {brands.map((brand) => (
            <span
              key={brand.name}
              className={`text-lg md:text-xl text-muted-foreground/60 select-none ${brand.font}`}
            >
              {brand.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
