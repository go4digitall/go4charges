import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { TrustBadgeSection } from "@/components/TrustBadgeSection";
import { CTASection } from "@/components/CTASection";
import { CountdownBanner } from "@/components/CountdownBanner";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: products, isLoading, error } = useProducts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CountdownBanner />
      <div className="pt-[72px] sm:pt-[52px]">
        <Header />
        <main className="flex-1">
          <HeroSection />
          
          {/* Products Section */}
          <section id="products" className="container py-12 md:py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
                Our Premium Products
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our range of high-quality charging cables, built to last and charge fast.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                Error loading products
              </div>
            ) : products && products.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {products.map((product) => (
                  <div key={product.node.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products available at the moment
              </div>
            )}
          </section>

          <BenefitsSection />
          <TrustBadgeSection />
          <TestimonialsSection />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
