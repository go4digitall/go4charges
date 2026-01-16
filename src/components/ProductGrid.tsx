import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Loader2, ShoppingBag } from "lucide-react";

export const ProductGrid = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">Erreur lors du chargement des produits</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
        <p className="text-muted-foreground">
          Les produits seront bientôt disponibles !
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.node.id} product={product} />
      ))}
    </div>
  );
};
