import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <section className="container py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Nos produits</h2>
          <ProductGrid />
        </section>
      </main>
      <footer className="border-t py-8 bg-secondary/5">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Go4charges. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
