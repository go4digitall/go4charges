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
      <div className="pt-14">
        <Header />
        <main className="flex-1">
          <HeroSection />
          
          {/* Products Section */}
          <section id="products" className="container py-12 md:py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Nos Produits Premium
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Découvrez notre gamme de câbles de charge haute qualité, conçus pour durer et charger rapidement.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                Erreur lors du chargement des produits
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.node.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Aucun produit disponible pour le moment
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
