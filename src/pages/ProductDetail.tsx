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

import avatarReview1 from "@/assets/testimonials/avatar-review-1.avif";
import avatarReview3 from "@/assets/testimonials/avatar-review-3.avif";
import productReview1 from "@/assets/testimonials/product-review-1.avif";
import productReview3 from "@/assets/testimonials/product-review-3.avif";

const productReviews = [
  { name: "M***k", date: "Jan 22, 2026", rating: 5, quote: "Incredible quality, charges super fast!", avatar: avatarReview1, productImage: productReview1, verified: true },
  { name: "R***n", date: "Jan 18, 2026", rating: 5, quote: "Premium feel, highly recommend!", avatar: avatarReview3, productImage: productReview3, verified: true },
];

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
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

  const handleCableTypeChange = (newType: CableType) => {
    setCableType(newType);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', newType);
    setSearchParams(newParams, { replace: true });
  };

  const getInitialBundleId = (): 'single' | 'duo' | 'family' => {
    const bundleParam = searchParams.get('bundle');
    if (bundleParam && ['single', 'duo', 'family'].includes(bundleParam)) {
      return bundleParam as 'single' | 'duo' | 'family';
    }
    if (handle) {
      const h = handle.toLowerCase();
      if (h.includes('duo') || h.includes('2x')) return 'duo';
      if (h.includes('family') || h.includes('3x') || h.includes('famille')) return 'family';
    }
    return 'family';
  };

  const [selectedBundleId, setSelectedBundleId] = useState<string>(getInitialBundleId());

  const getStockLevel = (bundleId: string): number => {
    const hash = bundleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 13) + 3;
  };
  
  const stockLevel = getStockLevel(selectedBundleId);
  const stockPercentage = (stockLevel / 15) * 100;
  const isLowStock = stockLevel < 5;
  const isMediumStock = stockLevel >= 5 && stockLevel < 10;

  const selectedBundle: BundleOption | undefined = bundleOptions.find(b => b.id === selectedBundleId);
  const product = selectedBundle?.product?.node;
  const images = product?.images?.edges || [];
  const currentImage = images[selectedImageIndex]?.node;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (selectedBundle && product) {
      trackViewContent({ content_name: product.title, content_ids: [selectedBundle.variantId], content_type: 'product', value: selectedBundle.price, currency: 'CAD' });
    }
  }, [selectedBundle?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        return Math.min(Math.max(prev + change, 12), 47);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isMobile) { setShowStickyButton(false); return; }
    const observer = new IntersectionObserver(([entry]) => { setShowStickyButton(!entry.isIntersecting); }, { threshold: 0 });
    const button = addToCartButtonRef.current;
    if (button) observer.observe(button);
    return () => { if (button) observer.unobserve(button); };
  }, [isMobile, product]);

  useEffect(() => { setSelectedImageIndex(0); }, [selectedBundleId]);

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
            <Link to="/"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to home</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedBundle) return;
    setIsAdding(true);
    try {
      await addItem({ product: selectedBundle.product, variantId: selectedBundle.variantId, variantTitle: selectedBundle.name, price: { amount: selectedBundle.price.toString(), currencyCode: 'CAD' }, quantity: 1, selectedOptions: [] });
      useCartStore.getState().setIsOpen(true);
      trackAddToCart({ content_name: selectedBundle.name, content_ids: [selectedBundle.variantId], content_type: 'product', value: selectedBundle.price, currency: 'CAD' });
      trackAnalyticsEvent('add_to_cart', { product_name: selectedBundle.name, bundle_type: selectedBundle.id, price: selectedBundle.price, variant_id: selectedBundle.variantId });
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container pt-[96px] sm:pt-[76px] pb-6 md:pb-10 relative">

        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 z-10">
                <div className="bg-foreground text-white text-sm font-bold py-2 px-4 text-center flex items-center justify-center gap-2 rounded-t-2xl">
                  <span>⚡</span><span>FLASH SALE</span><span>⚡</span>
                </div>
              </div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-secondary border border-border shadow-lg">
                {currentImage ? (
                  <img src={currentImage.url} alt={currentImage.altText || product?.title || 'Product'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImageIndex(index)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${index === selectedImageIndex ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/30'}`}>
                    <img src={img.node.url} alt={img.node.altText || `Image ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Zap className="h-3 w-3 mr-1" />Up to {cableType === 'lightning' ? '30W' : '240W'}
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Truck className="h-3 w-3 mr-1" />Free Shipping
              </Badge>
              <Badge variant="secondary" className="bg-foreground text-white">
                ⚡ Flash Sale
              </Badge>
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                ChargeStand™ (Up to {cableType === 'lightning' ? '30W' : '240W'})
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(1,000+ reviews)</span>
              </div>
            </div>

            {/* Flash Sale Banner */}
            <div className="bg-foreground text-white font-bold py-3 px-4 rounded-lg text-center">
              <span>⚡ FLASH SALE - UP TO 70% OFF!</span>
            </div>

            {/* Free Charger */}
            <div className="border border-primary/20 bg-primary/5 rounded-lg p-3 flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <span className="text-sm font-bold text-foreground">FREE Wall Charger ($49.90 value) with every Family Pack!</span>
            </div>

            {/* Active Viewers */}
            <div className="flex items-center gap-2 text-sm bg-secondary border border-border rounded-lg p-3">
              <Eye className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-medium text-foreground">
                <span className="font-bold">{viewerCount}</span> people are viewing this right now
              </span>
            </div>

            {/* Stock Level */}
            <div className={`rounded-lg p-3 border ${isLowStock ? 'bg-destructive/5 border-destructive/20' : isMediumStock ? 'bg-secondary border-border' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />}
                  <span className={`text-sm font-semibold ${isLowStock ? 'text-destructive' : isMediumStock ? 'text-muted-foreground' : 'text-primary'}`}>
                    {isLowStock ? `⚠️ Only ${stockLevel} left in stock!` : `Only ${stockLevel} in stock`}
                  </span>
                </div>
                {isLowStock && <Badge className="bg-destructive text-white text-xs animate-pulse">Selling Fast</Badge>}
              </div>
              <Progress value={stockPercentage} className={`h-2 ${isLowStock ? '[&>div]:bg-destructive' : isMediumStock ? '[&>div]:bg-muted-foreground' : '[&>div]:bg-primary'}`} />
            </div>

            <CableTypeSelector selectedType={cableType} onSelect={handleCableTypeChange} />
            <BundleSelector options={bundleOptions} selectedId={selectedBundleId} onSelect={setSelectedBundleId} isLoading={isLoading} />

            {/* Price Summary */}
            <div className="flex items-baseline gap-3 flex-wrap bg-secondary border border-border rounded-lg p-4">
              <span className="text-sm text-muted-foreground">Your price:</span>
              <span className="text-3xl font-bold text-primary">${price.toFixed(2)}</span>
              <span className="text-lg text-muted-foreground line-through">${compareAtPrice.toFixed(2)}</span>
              <Badge className="bg-primary text-white text-base px-3 py-1">-{discountPercent}%</Badge>
            </div>

            {/* Add to Cart */}
            <Button
              ref={addToCartButtonRef}
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300"
              onClick={handleAddToCart}
              disabled={isAdding || !selectedBundle}
            >
              {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShoppingCart className="h-5 w-5 mr-2" />⚡ Add to Cart - {selectedBundle?.name}</>}
            </Button>

            {/* Payment Methods */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <img src={paymentBadges} alt="Secure payment: Visa, Mastercard, American Express, PayPal, Google Pay" className="h-6 md:h-8 w-auto" />
              <p className="text-xs text-muted-foreground">Secure checkout with encrypted payment</p>
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Up to {cableType === 'lightning' ? '30W' : '240W'}</p>
                  <p className="text-xs text-muted-foreground">Ultra-fast charging</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">30-Day</p>
                  <p className="text-xs text-muted-foreground">Money-back guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Ships across Canada 🇨🇦</p>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="pt-4 md:pt-6 border-t border-border">
              <h3 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />Technical Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-secondary border border-border">
                  <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Power</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">Up to {cableType === 'lightning' ? '30W' : '240W'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-secondary border border-border">
                  <Cable className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Connector</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">{cableType === 'lightning' ? 'USB-C to Lightning' : 'Type-C to Type-C'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-secondary border border-border">
                  <Ruler className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Length</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">1.5m</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-secondary border border-border">
                  <Palette className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-xs text-muted-foreground">Color</p>
                    <p className="text-xs md:text-sm font-semibold text-foreground truncate">Black</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 md:mt-3 p-2 md:p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">Material</p>
                <p className="text-xs md:text-sm font-medium text-foreground">Alloy + TPE + Braided Wire (90°)</p>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="pt-4 md:pt-6 border-t border-border">
              <h3 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                Customer Reviews
              </h3>
              <div className="space-y-3 md:space-y-4">
                {productReviews.map((review, index) => (
                  <div key={index} className="p-3 md:p-4 rounded-xl bg-card border border-border shadow-sm">
                    <div className="flex items-start gap-2 md:gap-3">
                      <img src={review.avatar} alt={review.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-xs md:text-sm text-foreground">{review.name}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-[9px] md:text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                              <Check className="w-2 h-2 md:w-2.5 md:h-2.5 mr-0.5" /> Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-[#00b67a] flex items-center justify-center">
                                <Star className="w-2 h-2 md:w-2.5 md:h-2.5 fill-white text-white" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] md:text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-xs md:text-sm text-foreground mb-2 md:mb-3">"{review.quote}"</p>
                        {cableType !== 'lightning' && (
                          <img src={review.productImage} alt="Product review" className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg border border-border" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/#testimonials" className="mt-3 md:mt-4 inline-flex items-center text-xs md:text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                See all 1,247 reviews →
              </a>
            </div>
          </div>
        </div>
      </main>
      
      {/* Sticky Add to Cart - Mobile */}
      {showStickyButton && isMobile && selectedBundle && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border p-3 animate-fade-in">
          <div className="container flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground line-through">${compareAtPrice.toFixed(2)}</span>
            </div>
            <Button
              className="flex-1 max-w-[200px] h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShoppingCart className="h-4 w-4 mr-2" />⚡ Add to Cart</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
