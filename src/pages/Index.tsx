import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FreeChargerBanner } from "@/components/FreeChargerBanner";
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
          
          <FreeChargerBanner />
          
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
                    <span>WINTER CLEARANCE - UP TO 70% OFF!</span>
                    <span>❄️</span>
                  </div>
                  <p className="text-sm mt-1 text-blue-100">Limited Winter Stock • Free Shipping Worldwide</p>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
                  The <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">ChargeStand™</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Single Cable as entry point */}
                  {(() => {
                    const singleProduct = products.find(p => {
                      const handle = p.node.handle.toLowerCase();
                      // Find the single cable (not duo, not family, not wall-charger)
                      return !handle.includes('duo') && 
                             !handle.includes('2x') && 
                             !handle.includes('family') && 
                             !handle.includes('3x') &&
                             !handle.includes('famille') &&
                             !handle.includes('wall-charger');
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
                  className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold transition-colors"
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
