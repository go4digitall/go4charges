import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AsSeenSection } from "@/components/AsSeenSection";
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
          
          <AsSeenSection />
          
          <BenefitsSection />
          
          {/* Products Section */}
          <section id="products" className="py-12 md:py-16 bg-section-alt scroll-mt-40 md:scroll-mt-36">
            <div className="container">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
                  Our <span className="text-gradient">Premium</span> Products
                </h2>
                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
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
                <div className="flex flex-wrap justify-center items-stretch gap-6">
                  {/* Sort products to put Duo Pack first */}
                  {[...products]
                    .sort((a, b) => {
                      const aIsDuo = a.node.handle.toLowerCase().includes('duo');
                      const bIsDuo = b.node.handle.toLowerCase().includes('duo');
                      if (aIsDuo && !bIsDuo) return -1;
                      if (!aIsDuo && bIsDuo) return 1;
                      return 0;
                    })
                    .map((product) => {
                      const isFeatured = product.node.handle.toLowerCase().includes('duo');
                      return (
                        <div key={product.node.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm h-full">
                          <ProductCard product={product} isFeatured={isFeatured} />
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No products available at the moment
                </div>
              )}
            </div>
          </section>

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
