import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, ArrowLeft, Check, Zap, Shield, Truck, Star, Plug } from "lucide-react";
import { toast } from "sonner";
import paymentBadges from "@/assets/payment-badges.png";
import { trackViewContent, trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import wallChargerImage from "@/assets/wall-charger-240w.webp";

const WallChargerDetail = () => {
  const addItem = useCartStore(state => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const { data: productNode, isLoading, error } = useQuery({
    queryKey: ['wall-charger-product'],
    queryFn: () => fetchProductByHandle("wall-charger-240w-gan"),
    staleTime: 1000 * 60 * 5,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track ViewContent when product loads
  useEffect(() => {
    if (productNode) {
      const variant = productNode.variants?.edges?.[0]?.node;
      trackViewContent({
        content_name: productNode.title,
        content_ids: [variant?.id || productNode.id],
        content_type: 'product',
        value: parseFloat(variant?.price?.amount || '19.90'),
        currency: 'USD'
      });
    }
  }, [productNode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !productNode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not available</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const variant = productNode.variants?.edges?.[0]?.node;
  const price = parseFloat(variant?.price?.amount || '19.90');
  const compareAtPrice = parseFloat(variant?.compareAtPrice?.amount || '39.90');
  const discountPercent = Math.round((1 - price / compareAtPrice) * 100);

  const handleAddToCart = async () => {
    if (!productNode || !variant) return;
    
    setIsAdding(true);
    try {
      const wrappedProduct: ShopifyProduct = { node: productNode };
      
      await addItem({
        product: wrappedProduct,
        variantId: variant.id,
        variantTitle: "Wall Charger 240W GaN",
        price: { amount: price.toString(), currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: variant.selectedOptions || []
      });
      
      useCartStore.getState().setIsOpen(true);
      
      trackAddToCart({
        content_name: productNode.title,
        content_ids: [variant.id],
        content_type: 'product',
        value: price,
        currency: 'USD'
      });
      
      trackAnalyticsEvent('add_to_cart', {
        product_name: productNode.title,
        price: price,
        variant_id: variant.id
      });
    } catch (error) {
      toast.error("Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const features = [
    { icon: Zap, text: "240W Total Power Output" },
    { icon: Plug, text: "5 Ports: 3x USB-C PD + 2x USB-A QC3.0" },
    { icon: Shield, text: "GaN Technology - Compact & Cool" },
    { icon: Truck, text: "Free Worldwide Shipping" },
  ];

  // Use Shopify image or fallback
  const productImage = productNode.images?.edges?.[0]?.node?.url || wallChargerImage;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/50 to-background">
      <Header />
      <main className="flex-1 container pt-[96px] sm:pt-[76px] pb-6 md:pb-10">
        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 z-10">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold py-2 px-4 text-center flex items-center justify-center gap-2 rounded-t-2xl">
                  <Zap className="h-4 w-4" />
                  <span>240W GaN Technology</span>
                  <Zap className="h-4 w-4" />
                </div>
              </div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100/50 to-green-50/30 border border-emerald-200/50 shadow-lg shadow-emerald-500/10">
                <img
                  src={productImage}
                  alt={productNode.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                <Zap className="h-3 w-3 mr-1" />
                240W
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Truck className="h-3 w-3 mr-1" />
                Free Shipping
              </Badge>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                <Plug className="h-3 w-3 mr-1" />
                5 Ports
              </Badge>
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {productNode.title || "Wall Charger 240W GaN"}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(500+ reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground">
              {productNode.description || "Ultra-powerful 240W GaN wall charger with 5 ports. Charge your laptop, phone, tablet, and more - all at once with blazing fast speeds."}
            </p>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Bundle Promo */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-emerald-700 mb-1">🎁 Special Bundle Offer!</p>
              <p className="text-xs text-emerald-600">
                Get this charger <span className="font-bold">FREE</span> with the Family Pack or at <span className="font-bold">50% OFF</span> with the Duo Pack!
              </p>
              <Link 
                to="/product/chargestand-240w-90-fast-charging-cable?bundle=family"
                className="inline-block mt-2 text-xs text-emerald-700 font-semibold hover:underline"
              >
                View ChargeStand™ bundles →
              </Link>
            </div>

            {/* Price Summary */}
            <div className="flex items-baseline gap-3 flex-wrap bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="text-3xl font-bold text-emerald-600">
                ${price.toFixed(2)}
              </span>
              {compareAtPrice > price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${compareAtPrice.toFixed(2)}
                  </span>
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 text-base px-3 py-1">
                    -{discountPercent}%
                  </Badge>
                </>
              )}
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
              onClick={handleAddToCart}
              disabled={isAdding || !variant}
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            {/* Payment Methods */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <img 
                src={paymentBadges} 
                alt="Secure payment: Visa, Mastercard, American Express, PayPal, Google Pay" 
                className="h-6 md:h-8 w-auto"
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secure checkout • 30-day returns</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t">
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium">2-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                  <Check className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WallChargerDetail;
