import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { Star, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductCardProps {
  product: ShopifyProduct;
  isFeatured?: boolean;
}

export const ProductCard = ({ product, isFeatured = false }: ProductCardProps) => {
  const { node } = product;
  
  const image = node.images?.edges?.[0]?.node;
  const firstVariant = node.variants?.edges?.[0]?.node;
  const price = parseFloat(firstVariant?.price.amount || node.priceRange.minVariantPrice.amount);
  const currencyCode = firstVariant?.price.currencyCode || node.priceRange.minVariantPrice.currencyCode;
  
  const SINGLE_UNIT_ORIGINAL_PRICE = 49.90;
  let compareAtPrice = firstVariant?.compareAtPrice ? parseFloat(firstVariant.compareAtPrice.amount) : null;
  
  if (!compareAtPrice) {
    const handle = node.handle.toLowerCase();
    if (handle.includes('duo') || handle.includes('2x')) {
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE * 2;
    } else if (handle.includes('family') || handle.includes('3x')) {
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE * 3;
    } else {
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE;
    }
  }
  
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  const getStockLevel = (productId: string): number => {
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 3 + (hash % 13);
  };

  const stockLevel = getStockLevel(node.id);
  const isLowStock = stockLevel <= 5;
  const isMediumStock = stockLevel <= 10;
  const stockPercentage = Math.min((stockLevel / 20) * 100, 100);

  return (
    <Link 
      to={`/product/${node.handle}?bundle=family`}
      className="block group"
    >
      <Card className={`overflow-hidden relative h-full flex flex-col transition-all duration-300 bg-card ${
        isFeatured 
          ? 'border-2 border-primary shadow-xl shadow-primary/20 hover:shadow-2xl ring-2 ring-primary/20 scale-[1.02]' 
          : 'border-0 shadow-sm hover:shadow-lg glow-border hover-glow'
      }`}>
        {isFeatured && (
          <div className="absolute -top-1 -right-12 z-20 rotate-45 transform">
            <div className="bg-primary text-primary-foreground text-[10px] font-bold py-1 px-12 shadow-lg">
              BEST VALUE
            </div>
          </div>
        )}

        {/* Flash Sale Badge */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="bg-primary text-primary-foreground text-xs font-bold py-1.5 px-2 text-center flex items-center justify-center gap-1.5 rounded-t-lg">
            <span>{isFeatured ? '🏆' : '⚡'}</span>
            <span>{isFeatured ? 'MOST POPULAR CHOICE' : 'FLASH SALE'}</span>
            <span>{isFeatured ? '🏆' : '⚡'}</span>
          </div>
        </div>

        {isFeatured && (
          <div className="absolute top-10 left-3 z-10">
            <Badge className="bg-accent text-accent-foreground shadow-lg px-3 py-1.5 text-xs font-bold animate-pulse">
              <Star className="h-3.5 w-3.5 mr-1 fill-current" />
              #1 Best Seller
            </Badge>
          </div>
        )}
        
        <div className="absolute top-10 right-3 z-10">
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Up to 240W
          </Badge>
        </div>

        {/* Stock Level */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-3 py-2 z-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className={`h-3 w-3 ${isLowStock ? 'text-destructive' : isMediumStock ? 'text-accent' : 'text-primary'}`} />
            <span className={`text-xs font-semibold ${isLowStock ? 'text-destructive' : isMediumStock ? 'text-accent' : 'text-primary'}`}>
              Only {stockLevel} left in stock!
            </span>
          </div>
          <Progress 
            value={stockPercentage} 
            className={`h-1.5 ${isLowStock ? '[&>div]:bg-destructive' : isMediumStock ? '[&>div]:bg-accent' : '[&>div]:bg-primary'}`}
          />
        </div>

        <div className={`aspect-square overflow-hidden ${isFeatured ? 'bg-muted' : 'bg-muted/50'}`}>
          {image ? (
            <img
              src={image.url}
              alt={image.altText || node.title}
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4 pb-10 flex flex-col flex-1">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 transition-colors group-hover:text-primary text-foreground">
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
                <span className="font-bold text-lg text-foreground">
                  {price.toFixed(2)} {currencyCode}
                </span>
                {hasDiscount && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0">
                    -{Math.round((1 - price / compareAtPrice) * 100)}%
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
