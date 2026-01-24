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
import { ChatBot } from "@/components/ChatBot";
import { useProducts } from "@/hooks/useProducts";
import { useHashScroll } from "@/hooks/useHashScroll";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: products, isLoading, error } = useProducts();
  useHashScroll();

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
          <section id="products" className="py-12 md:py-16 bg-section-alt scroll-mt-56 md:scroll-mt-36">
            <div className="container">
              <div className="text-center mb-10">
                {/* Urgency Banner */}
                <div className="mb-6 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white py-3 px-4 rounded-xl shadow-lg shadow-red-500/30 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 text-lg font-bold animate-pulse">
                    <span>🔥</span>
                    <span>PRIX FOUS - OFFRE LIMITÉE !</span>
                    <span>🔥</span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">Jusqu'à -73% • Jusqu'à épuisement des stocks</p>
                </div>

                <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse shadow-lg shadow-amber-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  URGENT: Stock très limité
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
                  Nos <span className="text-gradient">Produits Premium</span>
                </h2>
                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Profitez de nos prix exceptionnels avant qu'il ne soit trop tard !
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
        <ChatBot />
      </div>
    </div>
  );
};

export default Index;
