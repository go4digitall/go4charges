import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";
import { Loader2, Zap, AlertTriangle, ShoppingCart } from "lucide-react";

const WALL_CHARGER_HANDLE = "wall-charger-240w-gan";

export const WallChargerCard = () => {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, setIsOpen } = useCartStore();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['wall-charger'],
    queryFn: () => fetchProductByHandle(WALL_CHARGER_HANDLE),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (error || !product) return null;

  const variant = product.variants?.edges?.[0]?.node;
  const image = product.images?.edges?.[0]?.node;
  const price = variant ? parseFloat(variant.price.amount) : 14.90;
  const currencyCode = variant?.price.currencyCode || "USD";
  const comparePrice = 29.90;
  const discount = Math.round(((comparePrice - price) / comparePrice) * 100);
  const stockLevel = 7;
  const stockPercentage = (stockLevel / 15) * 100;
  const isLowStock = stockLevel < 5;
  const isMediumStock = stockLevel >= 5 && stockLevel < 10;

  const handleAddToCart = async () => {
    if (!variant) return;
    
    setIsAdding(true);
    try {
      await addItem({
        product: { node: product } as ShopifyProduct,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });

      trackAddToCart({
        content_name: product.title,
        content_ids: [variant.id],
        content_type: "product",
        value: price,
        currency: variant.price.currencyCode,
      });

      trackAnalyticsEvent('add_to_cart', {
        product_name: product.title,
        price: price,
        variant_id: variant.id,
        source: 'homepage_wall_charger'
      });

      setIsOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 bg-card backdrop-blur relative h-full flex flex-col border-0 shadow-sm hover:shadow-lg glow-border hover-glow">
      {/* Hot Deal Banner - matching ProductCard style */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white text-xs font-bold py-1.5 px-2 text-center flex items-center justify-center gap-1.5 rounded-t-lg">
          <span>🔥</span>
          <span>HOT DEAL - {discount}% OFF</span>
          <span>🔥</span>
        </div>
      </div>

      {/* Power Badge */}
      <div className="absolute top-10 right-3 z-10">
        <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
          <Zap className="h-3 w-3 mr-1" />
          240W GaN
        </Badge>
      </div>

      {/* Best Seller Badge */}
      <div className="absolute top-10 left-3 z-10">
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg px-2 py-1 text-xs font-bold">
          ⚡ Best Seller
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

      {/* Product Image - Same aspect ratio as ProductCard */}
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
        {image?.url ? (
          <img 
            src={image.url} 
            alt={product.title} 
            className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Zap className="w-20 h-20 text-amber-400" />
          </div>
        )}
      </div>

      {/* Card Content - Same structure as ProductCard */}
      <CardContent className="p-4 pb-10 flex flex-col flex-1">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 transition-colors group-hover:text-primary">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          5-Port 240W GaN Fast Charger • 3x USB-C PD + 2x USB-A QC3.0
        </p>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground line-through">
              {comparePrice.toFixed(2)} {currencyCode}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">
                {price.toFixed(2)} {currencyCode}
              </span>
              <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs px-1.5 py-0">
                -{discount}%
              </Badge>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/30"
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
  );
};
