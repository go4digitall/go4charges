import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, ArrowLeft, Check, Zap, Shield, Truck, Star } from "lucide-react";
import { toast } from "sonner";
import { ShopifyProduct } from "@/lib/shopify";
import paymentBadges from "@/assets/payment-badges.png";
import { trackViewContent, trackAddToCart } from "@/lib/facebookPixel";

// Parse description into structured sections
const parseDescription = (description: string) => {
  const lines = description.split(/[•\n]/).map(line => line.trim()).filter(Boolean);
  const specs: { label: string; value: string }[] = [];
  let mainDescription = "";

  lines.forEach(line => {
    if (line.includes(":")) {
      const [label, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      if (label && value) {
        specs.push({ label: label.trim(), value });
      }
    } else if (line.length > 30) {
      mainDescription = line;
    }
  });

  return { specs, mainDescription };
};

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading, error } = useProduct(handle || '');
  const addItem = useCartStore(state => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Compute derived values (must be before hooks to maintain hook order)
  const images = product?.images?.edges || [];
  const currentImage = images[selectedImageIndex]?.node;
  const options = product?.options || [];
  
  // Filter out "Title" option with only "Default Title"
  const displayableOptions = options.filter(option => {
    if (option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title") {
      return false;
    }
    return true;
  });

  // Initialize selected options with first value of each option
  const effectiveOptions = { ...selectedOptions };
  options.forEach(option => {
    if (!effectiveOptions[option.name] && option.values.length > 0) {
      effectiveOptions[option.name] = option.values[0];
    }
  });

  // Find matching variant based on selected options
  const selectedVariant = product?.variants?.edges?.find(({ node }) => {
    return node.selectedOptions.every(
      opt => effectiveOptions[opt.name] === opt.value
    );
  })?.node || product?.variants?.edges?.[0]?.node;

  const { specs, mainDescription } = parseDescription(product?.description || '');

  // Track ViewContent when product loads
  useEffect(() => {
    if (product && selectedVariant) {
      const productPrice = parseFloat(selectedVariant.price.amount || product.priceRange.minVariantPrice.amount);
      const productCurrency = selectedVariant.price.currencyCode || product.priceRange.minVariantPrice.currencyCode;
      
      trackViewContent({
        content_name: product.title,
        content_ids: [selectedVariant.id],
        content_type: 'product',
        value: productPrice,
        currency: productCurrency
      });
    }
  }, [product?.id]);

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

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
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

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
      const shopifyProduct: ShopifyProduct = {
        node: product
      };
      
      await addItem({
        product: shopifyProduct,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || []
      });
      
      // Open cart drawer instead of showing toast
      useCartStore.getState().setIsOpen(true);
      
      // Track AddToCart event
      trackAddToCart({
        content_name: product.title,
        content_ids: [selectedVariant.id],
        content_type: 'product',
        value: parseFloat(selectedVariant.price.amount),
        currency: selectedVariant.price.currencyCode
      });
    } catch (error) {
      toast.error("Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const price = parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount);
  const currency = selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode;

  // Calculate compare at price - use Shopify's compareAtPrice if available,
  // otherwise calculate for bundles based on single unit price (49.90)
  const SINGLE_UNIT_ORIGINAL_PRICE = 49.90;
  let compareAtPrice: number | null = selectedVariant?.compareAtPrice 
    ? parseFloat(selectedVariant.compareAtPrice.amount) 
    : null;
  
  // For bundle products, calculate the compare price if not set in Shopify
  if (!compareAtPrice) {
    const handle = product.handle.toLowerCase();
    if (handle.includes('duo') || handle.includes('2x')) {
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE * 2; // 99.80
    } else if (handle.includes('family') || handle.includes('3x')) {
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE * 3; // 149.70
    } else {
      // For single products, use the original price
      compareAtPrice = SINGLE_UNIT_ORIGINAL_PRICE;
    }
  }
  
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / compareAtPrice) * 100) : 0;

  // Determine urgency message based on product type
  const getUrgencyMessage = () => {
    const handle = product.handle.toLowerCase();
    if (handle.includes('family') || handle.includes('3x')) {
      return "❄️ WINTER SALE - 73% OFF!";
    } else if (handle.includes('duo') || handle.includes('2x')) {
      return "❄️ WINTER SALE - 70% OFF!";
    }
    return "❄️ WINTER SALE - 60% OFF!";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/50 to-background">
      <Header />
      <main className="flex-1 container pt-[96px] sm:pt-[76px] pb-6 md:pb-10 relative">
        {/* Decorative snowflakes */}
        <div className="absolute top-24 left-[5%] text-sky-300/30 text-2xl pointer-events-none">❄</div>
        <div className="absolute top-32 right-[8%] text-blue-300/25 text-lg pointer-events-none">❄</div>
        <div className="absolute top-[40%] left-[3%] text-indigo-300/20 text-xl pointer-events-none hidden md:block">❄</div>
        <div className="absolute top-[60%] right-[5%] text-sky-300/25 text-base pointer-events-none hidden md:block">❄</div>

        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Winter Deal Badge on Image */}
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 z-10">
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold py-2 px-4 text-center flex items-center justify-center gap-2 rounded-t-2xl">
                  <span>❄️</span>
                  <span>WINTER DEAL</span>
                  <span>❄️</span>
                </div>
              </div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100/50 to-blue-50/30 border border-sky-200/50 shadow-lg shadow-blue-500/10">
                {currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.altText || product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      index === selectedImageIndex 
                        ? 'border-sky-500 shadow-md shadow-sky-500/20' 
                        : 'border-transparent hover:border-sky-300'
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 hover:bg-sky-500/20">
                <Zap className="h-3 w-3 mr-1" />
                Up to 240W
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Truck className="h-3 w-3 mr-1" />
                Free Shipping
              </Badge>
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                ❄️ Winter Special
              </Badge>
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{product.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(1,000+ reviews)</span>
              </div>
            </div>

            {/* Winter Urgency Banner */}
            <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg text-center relative overflow-hidden">
              {/* Snowflake decorations */}
              <div className="absolute top-1 left-3 text-white/20 text-sm">❄</div>
              <div className="absolute bottom-1 right-4 text-white/20 text-sm">❄</div>
              <span className="relative z-10">{getUrgencyMessage()}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                {price.toFixed(2)} {currency}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {compareAtPrice.toFixed(2)} {currency}
                  </span>
                  <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 text-base px-3 py-1">
                    -{discountPercent}%
                  </Badge>
                </>
              )}
            </div>
            
            {/* Limited Time Notice - Winter themed */}
            <div className="flex items-center gap-2 text-sm text-sky-700 bg-sky-50 border border-sky-200 rounded-lg p-3">
              <span className="text-lg">❄️</span>
              <span className="font-medium">Winter Closeout - Final prices while supplies last!</span>
            </div>

            {/* Main Description */}
            {mainDescription && (
              <p className="text-muted-foreground leading-relaxed">
                {mainDescription}
              </p>
            )}

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-sm text-foreground mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{spec.label}</span>
                      <span className="text-sm font-medium text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            {displayableOptions.map((option) => (
              <div key={option.name}>
                <label className="block text-sm font-semibold mb-3 text-foreground">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                      className={`px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                        effectiveOptions[option.name] === value
                          ? 'border-sky-500 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                          : 'border-border bg-background hover:border-sky-300 text-foreground'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Add to Cart - Winter themed */}
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              onClick={handleAddToCart}
              disabled={isAdding || !selectedVariant?.availableForSale}
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : !selectedVariant?.availableForSale ? (
                "Out of stock"
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  ❄️ Add to Cart - Winter Sale
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
              <p className="text-xs text-muted-foreground">Secure checkout with encrypted payment</p>
            </div>

            {/* Trust Features - Winter themed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 border border-sky-100">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Up to 240W</p>
                  <p className="text-xs text-muted-foreground">Ultra-fast charging</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">30-Day</p>
                  <p className="text-xs text-muted-foreground">Money-back guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Worldwide delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
