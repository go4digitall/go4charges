import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  
  const image = node.images?.edges?.[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants?.edges?.[0]?.node;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return;
    
    setIsAdding(true);
    try {
      await addItem({
        product,
        variantId: firstVariant.id,
        variantTitle: firstVariant.title,
        price: firstVariant.price,
        quantity: 1,
        selectedOptions: firstVariant.selectedOptions || []
      });
      toast.success("Added to cart", {
        description: node.title,
        position: "top-center"
      });
    } catch (error) {
      toast.error("Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link to={`/product/${node.handle}`}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur glow-border hover-glow">
        <div className="aspect-square overflow-hidden bg-primary/5">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || node.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {node.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {node.description}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-lg text-primary">
              {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
            </span>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={isAdding || !firstVariant?.availableForSale}
              className="bg-primary hover:bg-primary/90"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
