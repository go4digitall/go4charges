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
          <section id="products" className="py-12 md:py-16 bg-gradient-to-b from-sky-50 to-blue-50 scroll-mt-56 md:scroll-mt-36 relative overflow-hidden">
            {/* Decorative snowflakes */}
            <div className="absolute top-4 left-[10%] text-sky-300/40 text-2xl pointer-events-none">❄</div>
            <div className="absolute top-12 right-[15%] text-blue-300/30 text-lg pointer-events-none">❄</div>
            <div className="absolute bottom-8 left-[20%] text-indigo-300/25 text-xl pointer-events-none">❄</div>
            <div className="absolute bottom-16 right-[25%] text-sky-300/35 text-base pointer-events-none">❄</div>
            
            <div className="container">
              <div className="text-center mb-10">
                {/* Winter Clearance Banner */}
                <div className="mb-6 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 max-w-2xl mx-auto relative overflow-hidden">
                  <div className="absolute top-1 left-4 text-white/20 text-lg">❄</div>
                  <div className="absolute top-2 right-6 text-white/15 text-sm">❄</div>
                  <div className="absolute bottom-1 right-12 text-white/20 text-base">❄</div>
                  
                  <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold">
                    <span>❄️</span>
                    <span>WINTER CLEARANCE - FINAL PRICES!</span>
                    <span>❄️</span>
                  </div>
                  <p className="text-sm mt-1 text-blue-100">Up to 73% OFF • Limited Winter Stock</p>
                </div>

                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg shadow-blue-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  URGENT: Very Limited Stock
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
                  Our <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Premium</span> Products
                </h2>
                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Grab these winter deals before they melt away!
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
                {/* Sort products: Family first, then Duo, then others */}
                  {[...products]
                    .sort((a, b) => {
                      const aIsFamily = a.node.handle.toLowerCase().includes('family') || a.node.handle.toLowerCase().includes('3x');
                      const bIsFamily = b.node.handle.toLowerCase().includes('family') || b.node.handle.toLowerCase().includes('3x');
                      const aIsDuo = a.node.handle.toLowerCase().includes('duo') || a.node.handle.toLowerCase().includes('2x');
                      const bIsDuo = b.node.handle.toLowerCase().includes('duo') || b.node.handle.toLowerCase().includes('2x');
                      
                      // Family pack first
                      if (aIsFamily && !bIsFamily) return -1;
                      if (!aIsFamily && bIsFamily) return 1;
                      // Then Duo pack
                      if (aIsDuo && !bIsDuo) return -1;
                      if (!aIsDuo && bIsDuo) return 1;
                      return 0;
                    })
                    .map((product) => {
                      const isFeatured = product.node.handle.toLowerCase().includes('family') || product.node.handle.toLowerCase().includes('3x');
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
