import { useState, useEffect, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingCart, Loader2, ArrowLeft, Check, Zap, Shield, Truck, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import paymentBadges from "@/assets/payment-badges.png";
import { trackViewContent, trackAddToCart } from "@/lib/facebookPixel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBundleProducts, BundleOption } from "@/hooks/useBundleProducts";
import { BundleSelector } from "@/components/BundleSelector";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams] = useSearchParams();
  const { bundleOptions, isLoading, error } = useBundleProducts();
  const addItem = useCartStore(state => state.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [viewerCount, setViewerCount] = useState(() => Math.floor(Math.random() * 36) + 12);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

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

  // Get currently selected bundle
  const selectedBundle: BundleOption | undefined = bundleOptions.find(b => b.id === selectedBundleId);
  const product = selectedBundle?.product?.node;

  // Images from the selected bundle's product
  const images = product?.images?.edges || [];
  const currentImage = images[selectedImageIndex]?.node;

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
      
      trackAddToCart({
        content_name: selectedBundle.name,
        content_ids: [selectedBundle.variantId],
        content_type: 'product',
        value: selectedBundle.price,
        currency: 'USD'
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
