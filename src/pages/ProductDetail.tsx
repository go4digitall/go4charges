import { useState, useEffect, useRef } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, ArrowLeft, Check, Zap, Shield, Truck, Star, Eye, AlertTriangle, Cable, Ruler, Palette } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import paymentBadges from "@/assets/payment-badges.png";
import { trackViewContent, trackAddToCart } from "@/lib/facebookPixel";
import { trackAnalyticsEvent } from "@/hooks/useAnalyticsTracking";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBundleProducts, BundleOption, CableType, CABLE_TYPE_INFO } from "@/hooks/useBundleProducts";
import { BundleSelector } from "@/components/BundleSelector";
import { CableTypeSelector } from "@/components/CableTypeSelector";

// Import review assets from testimonials
import avatarReview1 from "@/assets/testimonials/avatar-review-1.avif";
import avatarReview3 from "@/assets/testimonials/avatar-review-3.avif";
import productReview1 from "@/assets/testimonials/product-review-1.avif";
import productReview3 from "@/assets/testimonials/product-review-3.avif";

// Product reviews data
const productReviews = [
  {
    name: "M***k",
    date: "Jan 22, 2026",
    rating: 5,
    quote: "Incredible quality, charges super fast!",
    avatar: avatarReview1,
    productImage: productReview1,
    verified: true
  },
  {
    name: "R***n",
    date: "Jan 18, 2026",
    rating: 5,
    quote: "Premium feel, highly recommend!",
    avatar: avatarReview3,
    productImage: productReview3,
    verified: true
  }
];

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Determine initial cable type from URL
  const getInitialCableType = (): CableType => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'lightning') return 'lightning';
    return 'usbc';
  };
  
  const [cableType, setCableType] = useState<CableType>(getInitialCableType());
  const { bundleOptions, isLoading, error } = useBundleProducts(cableType);
  const addItem = useCartStore(state => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [viewerCount, setViewerCount] = useState(() => Math.floor(Math.random() * 36) + 12);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  // Handle cable type change with URL update
  const handleCableTypeChange = (newType: CableType) => {
    setCableType(newType);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', newType);
    setSearchParams(newParams, { replace: true });
  };

  // Determine initial bundle selection based on URL handle or query param
  const getInitialBundleId = (): 'single' | 'duo' | 'family' => {
    const bundleParam = searchParams.get('bundle');
    if (bundleParam && ['single', 'duo', 'family'].includes(bundleParam)) {
      return bundleParam as 'single' | 'duo' | 'family';
    }
    
    // Check current handle to pre-select appropriate bundle
    if (handle) {
      const h = handle.toLowerCase();
      if (h.includes('duo') || h.includes('2x')) return 'duo';
      if (h.includes('family') || h.includes('3x') || h.includes('famille')) return 'family';
    }
    
    // Default to family for best conversion
    return 'family';
  };

  const [selectedBundleId, setSelectedBundleId] = useState<string>(getInitialBundleId());

  // Deterministic stock level based on bundle ID
  const getStockLevel = (bundleId: string): number => {
    const hash = bundleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 13) + 3; // Returns 3-15
  };
  
  const stockLevel = getStockLevel(selectedBundleId);
  const stockPercentage = (stockLevel / 15) * 100;
  const isLowStock = stockLevel < 5;
  const isMediumStock = stockLevel >= 5 && stockLevel < 10;

  // Get currently selected bundle
  const selectedBundle: BundleOption | undefined = bundleOptions.find(b => b.id === selectedBundleId);
  const product = selectedBundle?.product?.node;

  // Images from the selected bundle's product
  const images = product?.images?.edges || [];
  const currentImage = images[selectedImageIndex]?.node;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track ViewContent when bundle loads
  useEffect(() => {
    if (selectedBundle && product) {
      trackViewContent({
        content_name: product.title,
        content_ids: [selectedBundle.variantId],
        content_type: 'product',
        value: selectedBundle.price,
        currency: 'USD'
      });
    }
  }, [selectedBundle?.id]);

  // Viewer count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        const newCount = prev + change;
        return Math.min(Math.max(newCount, 12), 47);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sticky button visibility
  useEffect(() => {
    if (!isMobile) {
      setShowStickyButton(false);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyButton(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    
    const button = addToCartButtonRef.current;
    if (button) {
      observer.observe(button);
    }
    
    return () => {
      if (button) {
        observer.unobserve(button);
      }
    };
  }, [isMobile, product]);

  // Reset image index when bundle changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedBundleId]);

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

  if (error || bundleOptions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Products not available</h1>
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
    if (!selectedBundle) return;
    
    setIsAdding(true);
    try {
      await addItem({
        product: selectedBundle.product,
        variantId: selectedBundle.variantId,
        variantTitle: selectedBundle.name,
        price: { amount: selectedBundle.price.toString(), currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: []
      });
      
      useCartStore.getState().setIsOpen(true);
      
      // Facebook Pixel tracking
      trackAddToCart({
        content_name: selectedBundle.name,
        content_ids: [selectedBundle.variantId],
        content_type: 'product',
        value: selectedBundle.price,
        currency: 'USD'
      });
      
      // Database analytics tracking
      trackAnalyticsEvent('add_to_cart', {
        product_name: selectedBundle.name,
        bundle_type: selectedBundle.id,
        price: selectedBundle.price,
        variant_id: selectedBundle.variantId
      });
    } catch (error) {
      toast.error("Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const price = selectedBundle?.price || 0;
  const compareAtPrice = selectedBundle?.comparePrice || 0;
  const discountPercent = selectedBundle?.discountPercent || 0;

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
                    alt={currentImage.altText || product?.title || 'Product'}
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                ChargeStand™ (Up to 240W)
              </h1>
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
              <div className="absolute top-1 left-3 text-white/20 text-sm">❄</div>
              <div className="absolute bottom-1 right-4 text-white/20 text-sm">❄</div>
              <span className="relative z-10">❄️ WINTER SALE - UP TO 70% OFF!</span>
            </div>

            {/* Active Viewers Counter */}
            <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Eye className="h-4 w-4 text-amber-600 animate-pulse" />
              <span className="font-medium text-amber-700">
                <span className="font-bold">{viewerCount}</span> people are viewing this right now
              </span>
            </div>

            {/* Stock Level Indicator */}
            <div className={`rounded-lg p-3 border ${
              isLowStock 
                ? 'bg-red-50 border-red-200' 
                : isMediumStock 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isLowStock && <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />}
                  <span className={`text-sm font-semibold ${
                    isLowStock 
                      ? 'text-red-600' 
                      : isMediumStock 
                        ? 'text-amber-600' 
                        : 'text-green-600'
                  }`}>
                    {isLowStock 
                      ? `⚠️ Only ${stockLevel} left in stock!` 
                      : `Only ${stockLevel} in stock`
                    }
                  </span>
                </div>
                {isLowStock && (
                  <Badge className="bg-red-500 text-white text-xs animate-pulse">
                    Selling Fast
                  </Badge>
                )}
              </div>
              <Progress 
                value={stockPercentage} 
                className={`h-2 ${
                  isLowStock 
                    ? '[&>div]:bg-red-500' 
                    : isMediumStock 
                      ? '[&>div]:bg-amber-500' 
                      : '[&>div]:bg-green-500'
                }`}
              />
            </div>

            {/* Cable Type Selector */}
            <CableTypeSelector
              selectedType={cableType}
              onSelect={handleCableTypeChange}
            />

            {/* Bundle Selector */}
            <BundleSelector
              options={bundleOptions}
              selectedId={selectedBundleId}
              onSelect={setSelectedBundleId}
              isLoading={isLoading}
            />

            {/* Price Summary */}
            <div className="flex items-baseline gap-3 flex-wrap bg-sky-50 border border-sky-100 rounded-lg p-4">
              <span className="text-sm text-muted-foreground">Your price:</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                ${price.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
              <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 text-base px-3 py-1">
                -{discountPercent}%
              </Badge>
            </div>

            {/* Add to Cart */}
            <Button
              ref={addToCartButtonRef}
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              onClick={handleAddToCart}
              disabled={isAdding || !selectedBundle}
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  ❄️ Add to Cart - {selectedBundle?.name}
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

            {/* Trust Features */}
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

            {/* Technical Specifications */}
            <div className="pt-4 md:pt-6 border-t border-border">
              <h3 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-sky-500" />
                Technical Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50 border border-border/50">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-sky-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Power</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">Up to 240W</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50 border border-border/50">
                  <Cable className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Connector</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                      {cableType === 'lightning' ? 'USB-C to Lightning' : 'Type-C to Type-C'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50 border border-border/50">
                  <Ruler className="h-4 w-4 md:h-5 md:w-5 text-indigo-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Length</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">1.5m</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/50 border border-border/50">
                  <Palette className="h-4 w-4 md:h-5 md:w-5 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Color</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">Black</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 md:mt-3 p-2 md:p-3 rounded-lg bg-sky-50 border border-sky-100">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Material</p>
                <p className="text-xs md:text-sm font-medium text-foreground">Alloy + TPE + Braided Wire (90°)</p>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="pt-4 md:pt-6 border-t border-border">
              <h3 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 md:h-4 md:w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                Customer Reviews
              </h3>
              <div className="space-y-3 md:space-y-4">
                {productReviews.map((review, index) => (
                  <div key={index} className="p-3 md:p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                    <div className="flex items-start gap-2 md:gap-3">
                      <img 
                        src={review.avatar} 
                        alt={review.name}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-xs md:text-sm text-foreground">{review.name}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">
                              <Check className="w-2 h-2 md:w-2.5 md:h-2.5 mr-0.5" /> Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-green-500 flex items-center justify-center">
                                <Star className="w-2 h-2 md:w-2.5 md:h-2.5 fill-white text-white" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] md:text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-xs md:text-sm text-foreground mb-2 md:mb-3">"{review.quote}"</p>
                        <img 
                          src={review.productImage} 
                          alt="Product review"
                          className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg border border-border/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <a 
                href="/#testimonials" 
                className="mt-3 md:mt-4 inline-flex items-center text-xs md:text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
              >
                See all 1,247 reviews →
              </a>
            </div>
          </div>
        </div>
      </main>
      
      {/* Sticky Add to Cart Button - Mobile Only */}
      {showStickyButton && isMobile && selectedBundle && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border p-3 animate-fade-in">
          <div className="container flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">
                ${price.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
            </div>
            <Button
              className="flex-1 max-w-[200px] h-12 text-base font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  ❄️ Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
