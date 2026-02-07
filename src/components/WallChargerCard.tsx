import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";
import { Loader2, Zap, Shield, Flame, Package } from "lucide-react";

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
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) return null;

  const variant = product.variants?.edges?.[0]?.node;
  const image = product.images?.edges?.[0]?.node;
  const price = variant ? parseFloat(variant.price.amount) : 14.90;
  const comparePrice = 29.90; // Original price
  const discount = Math.round(((comparePrice - price) / comparePrice) * 100);

  // Simulated stock (deterministic based on product ID)
  const stockLevel = 7;

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
    <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden relative">
      {/* Hot Deal Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white py-2 px-4 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 relative z-10">
          <Flame className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-wide">Hot Deal - {discount}% Off</span>
          <Flame className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="relative flex-shrink-0 mx-auto md:mx-0">
            <div className="w-48 h-48 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center overflow-hidden">
              {image?.url ? (
                <img 
                  src={image.url} 
                  alt={product.title} 
                  className="w-full h-full object-contain p-4"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <Zap className="w-20 h-20 text-amber-400" />
              )}
            </div>
            {/* Best Seller Badge */}
            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-3 py-1 shadow-lg">
              BEST SELLER
            </Badge>
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {product.title}
              </h3>
              
              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span><strong>240W GaN Technology</strong> - Ultra-fast charging</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span><strong>5 Ports</strong> - 3x USB-C + 2x USB-A</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span><strong>Cool & Safe</strong> - Advanced heat protection</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-bold text-amber-600">${price.toFixed(2)}</span>
                <span className="text-lg text-gray-400 line-through">${comparePrice.toFixed(2)}</span>
                <Badge className="bg-red-500 text-white">-{discount}%</Badge>
              </div>

              {/* Stock Warning */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[150px]">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full animate-pulse"
                    style={{ width: `${(stockLevel / 15) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-red-600">
                  🔥 Only {stockLevel} left!
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 text-lg font-bold shadow-lg shadow-orange-500/30"
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  ADD TO CART - ${price.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
