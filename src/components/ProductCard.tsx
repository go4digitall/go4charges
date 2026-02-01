import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, Star, Zap, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { trackAddToCart } from "@/lib/facebookPixel";

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
    } else {
      // Single product fallback
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE; // 49.90
    }
  }
  
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  // Generate deterministic stock level based on product ID
  const getStockLevel = (productId: string): number => {
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 3 + (hash % 13); // Between 3 and 15
  };
  
  const stockLevel = getStockLevel(node.id);
  const stockPercentage = (stockLevel / 15) * 100;
  const isLowStock = stockLevel < 5;
  const isMediumStock = stockLevel >= 5 && stockLevel < 10;

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
      
      // Open cart drawer instead of showing toast
      useCartStore.getState().setIsOpen(true);
      
      // Track AddToCart event
      trackAddToCart({
        content_name: node.title,
        content_ids: [firstVariant.id],
        content_type: 'product',
        value: price,
        currency: currencyCode
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
          ? 'border-2 border-amber-500 shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 ring-4 ring-amber-500/30 scale-[1.02]' 
          : 'border-0 shadow-sm hover:shadow-lg glow-border hover-glow'
      }`}>
        {/* Featured Ribbon */}
        {isFeatured && (
          <div className="absolute -top-1 -right-12 z-20 rotate-45 transform">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold py-1 px-12 shadow-lg">
              BEST VALUE
            </div>
          </div>
        )}

        {/* Winter Deal Badge */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className={`text-white text-xs font-bold py-1.5 px-2 text-center flex items-center justify-center gap-1.5 rounded-t-lg ${
            isFeatured 
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500'
              : 'bg-gradient-to-r from-sky-500 to-blue-600'
          }`}>
            <span>{isFeatured ? '🏆' : '❄️'}</span>
            <span>{isFeatured ? 'MOST POPULAR CHOICE' : 'WINTER DEAL'}</span>
            <span>{isFeatured ? '🏆' : '❄️'}</span>
          </div>
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-10 left-3 z-10">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg px-3 py-1.5 text-xs font-bold animate-pulse">
              <Star className="h-3.5 w-3.5 mr-1 fill-white" />
              #1 Best Seller
            </Badge>
          </div>
        )}
        
        {/* Power Badge */}
        <div className="absolute top-10 right-3 z-10">
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Up to 240W
          </Badge>
        </div>

        {/* Stock Level Indicator */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-3 py-2 z-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className={`h-3 w-3 ${isLowStock ? 'text-red-500' : isMediumStock ? 'text-orange-500' : 'text-green-500'}`} />
            <span className={`text-xs font-semibold ${isLowStock ? 'text-red-600' : isMediumStock ? 'text-orange-600' : 'text-green-600'}`}>
              Only {stockLevel} left in stock!
            </span>
          </div>
          <Progress 
            value={stockPercentage} 
            className={`h-1.5 ${isLowStock ? '[&>div]:bg-red-500' : isMediumStock ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
          />
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
        <CardContent className={`p-4 pb-10 flex flex-col flex-1 ${isFeatured ? 'bg-gradient-to-b from-amber-50/50 to-transparent' : ''}`}>
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
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {compareAtPrice.toFixed(2)} {currencyCode}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${isFeatured ? 'text-amber-600' : 'text-primary'}`}>
                  {price.toFixed(2)} {currencyCode}
                </span>
                {hasDiscount && (
                  <Badge className="bg-sky-500 text-white hover:bg-sky-600 text-xs px-1.5 py-0">
                    -{Math.round((1 - price / compareAtPrice) * 100)}%
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={isAdding || !firstVariant?.availableForSale}
              className={isFeatured 
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/30" 
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
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
