import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, Star, Zap } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
  isFeatured?: boolean;
}

export const ProductCard = ({ product, isFeatured = false }: ProductCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  
  const image = node.images?.edges?.[0]?.node;
  const firstVariant = node.variants?.edges?.[0]?.node;
  const price = parseFloat(firstVariant?.price.amount || node.priceRange.minVariantPrice.amount);
  const currencyCode = firstVariant?.price.currencyCode || node.priceRange.minVariantPrice.currencyCode;
  
  // Calculate compare at price - use Shopify's compareAtPrice if available, 
  // otherwise calculate for bundles based on single unit price (49.90)
  const SINGLE_UNIT_ORIGINAL_PRICE = 49.90;
  let compareAtPrice = firstVariant?.compareAtPrice ? parseFloat(firstVariant.compareAtPrice.amount) : null;
  
  // For bundle products, calculate the compare price if not set in Shopify
  if (!compareAtPrice) {
    const handle = node.handle.toLowerCase();
    if (handle.includes('duo') || handle.includes('2x')) {
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE * 2; // 99.80
    } else if (handle.includes('family') || handle.includes('3x')) {
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE * 3; // 149.70
    }
  }
  
  const hasDiscount = compareAtPrice && compareAtPrice > price;

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
    <Link to={`/product/${node.handle}`} className="h-full">
      <Card className={`group overflow-hidden transition-all duration-300 bg-card backdrop-blur relative h-full flex flex-col ${
        isFeatured 
          ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 ring-2 ring-amber-500/20' 
          : 'border-0 shadow-sm hover:shadow-lg glow-border hover-glow'
      }`}>
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-amber-500 text-white hover:bg-amber-600 shadow-md px-3 py-1">
              <Star className="h-3 w-3 mr-1 fill-white" />
              Best Seller
            </Badge>
          </div>
        )}
        
        {/* Power Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Up to 240W
          </Badge>
        </div>

        <div className={`aspect-square overflow-hidden ${isFeatured ? 'bg-gradient-to-br from-amber-50 to-amber-100/50' : 'bg-secondary/10'}`}>
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
        <CardContent className={`p-4 flex flex-col flex-1 ${isFeatured ? 'bg-gradient-to-b from-amber-50/50 to-transparent' : ''}`}>
          <h3 className={`font-semibold text-sm mb-1 line-clamp-2 transition-colors ${
            isFeatured ? 'text-foreground group-hover:text-amber-600' : 'group-hover:text-primary'
          }`}>
            {node.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
            {node.description}
          </p>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${isFeatured ? 'text-amber-600' : 'text-primary'}`}>
                  {price.toFixed(2)} {currencyCode}
                </span>
                {hasDiscount && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs px-1.5 py-0">
                    -{Math.round((1 - price / compareAtPrice) * 100)}%
                  </Badge>
                )}
              </div>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {compareAtPrice.toFixed(2)} {currencyCode}
                </span>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={isAdding || !firstVariant?.availableForSale}
              className={isFeatured 
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30" 
                : "bg-primary hover:bg-primary/90"
              }
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
