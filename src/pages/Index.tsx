import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AsSeenSection } from "@/components/AsSeenSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { CountdownBanner } from "@/components/CountdownBanner";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WallChargerCard } from "@/components/WallChargerCard";
import { useProducts } from "@/hooks/useProducts";
import { useHashScroll } from "@/hooks/useHashScroll";
import { Loader2 } from "lucide-react";

// Lazy load below-the-fold components for better performance
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const FAQSection = lazy(() => import("@/components/FAQSection").then(m => ({ default: m.FAQSection })));
const TrustBadgeSection = lazy(() => import("@/components/TrustBadgeSection").then(m => ({ default: m.TrustBadgeSection })));
const CTASection = lazy(() => import("@/components/CTASection").then(m => ({ default: m.CTASection })));
const ChatBot = lazy(() => import("@/components/ChatBot").then(m => ({ default: m.ChatBot })));

const Index = () => {
  const { data: products, isLoading, error } = useProducts();
  useHashScroll();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CountdownBanner />
      <div className="pt-[46px] sm:pt-[64px]">
        <Header />
        <main className="flex-1">
          <HeroSection />
          
          <AsSeenSection />
          
          <BenefitsSection />
          
          {/* Products Section */}
          <section id="products" className="py-12 md:py-16 bg-card scroll-mt-56 md:scroll-mt-36 relative overflow-hidden">
            <div className="container">
              <div className="text-center mb-10">
                {/* Flash Sale Banner */}
                <div className="mb-6 bg-primary text-primary-foreground py-4 px-6 rounded-xl shadow-lg shadow-primary/20 max-w-2xl mx-auto relative overflow-hidden">
                  <div className="flex items-center justify-center gap-2 text-lg md:text-xl font-bold">
                    <span>⚡</span>
                    <span>FLASH SALE — UP TO 70% OFF!</span>
                    <span>⚡</span>
                  </div>
                  <p className="text-sm mt-1 opacity-80">Limited Stock • Free Shipping Across Canada 🇨🇦 • FREE Charger with Family Pack 🎁</p>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-foreground">
                  The <span className="text-gradient">ChargeStand™</span>
                </h2>
                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Ultra-fast charging cable with up to 240W power delivery
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive">
                  Error loading product
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                  {/* Single Cable Card */}
                  {(() => {
                    const singleProduct = products.find(p => {
                      const handle = p.node.handle.toLowerCase();
                      return !handle.includes('duo') && 
                             !handle.includes('2x') && 
                             !handle.includes('family') && 
                             !handle.includes('3x') &&
                             !handle.includes('famille') &&
                             !handle.includes('charger');
                    }) || products[0];
                    
                    return (
                      <div className="w-full">
                        <ProductCard product={singleProduct} isFeatured={false} />
                      </div>
                    );
                  })()}
                  
                  {/* Wall Charger Card */}
                  <div className="w-full">
                    <WallChargerCard />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No products available at the moment
                </div>
              )}
              
              {/* See All Options CTA */}
              <div className="text-center mt-8">
                <p className="text-muted-foreground mb-3">Looking for a different pack size?</p>
                <a 
                  href="/product/chargestand-240w-90-fast-charging-cable?bundle=family" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  View all bundle options →
                </a>
              </div>
            </div>
          </section>

          <Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <TrustBadgeSection />
          </Suspense>
          <Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <TestimonialsSection />
          </Suspense>
          <Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <FAQSection />
          </Suspense>
          <Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <CTASection />
          </Suspense>
        </main>
        <Footer />
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
