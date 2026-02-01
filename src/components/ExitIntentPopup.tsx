import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Clock, Snowflake, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const POPUP_SHOWN_KEY = "exit-intent-shown";
const POPUP_COOLDOWN_HOURS = 24;
const PROMO_CODE = "PROMO10";

export const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Mobile scroll tracking
  const lastScrollY = useRef(0);
  const maxScrollY = useRef(0);
  const scrollUpCount = useRef(0);

  const hasRecentlyShown = useCallback(() => {
    const lastShown = localStorage.getItem(POPUP_SHOWN_KEY);
    if (!lastShown) return false;
    const hoursSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
    return hoursSinceShown < POPUP_COOLDOWN_HOURS;
  }, []);

  const markAsShown = useCallback(() => {
    localStorage.setItem(POPUP_SHOWN_KEY, Date.now().toString());
  }, []);

  const triggerPopup = useCallback(() => {
    if (!hasRecentlyShown() && !isOpen) {
      setIsOpen(true);
      markAsShown();
    }
  }, [hasRecentlyShown, isOpen, markAsShown]);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches || 'ontouchstart' in window;
    
    // Desktop: mouse leave from top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        triggerPopup();
      }
    };

    // Mobile: scroll up after scrolling down significantly
    const handleScroll = () => {
      const currentY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Track max scroll position
      if (currentY > maxScrollY.current) {
        maxScrollY.current = currentY;
        scrollUpCount.current = 0;
      }
      
      // Only trigger if user has scrolled down at least 50% of viewport
      const hasScrolledEnough = maxScrollY.current > viewportHeight * 0.5;
      
      // Detect scroll up
      if (currentY < lastScrollY.current && hasScrolledEnough) {
        scrollUpCount.current += lastScrollY.current - currentY;
        
        // Trigger if scrolled up more than 300px towards top
        if (scrollUpCount.current > 300 && currentY < viewportHeight * 0.3) {
          triggerPopup();
        }
      } else if (currentY > lastScrollY.current) {
        scrollUpCount.current = 0;
      }
      
      lastScrollY.current = currentY;
    };

    // Delay before enabling triggers (5 seconds)
    const timer = setTimeout(() => {
      if (isMobile) {
        window.addEventListener("scroll", handleScroll, { passive: true });
      } else {
        document.addEventListener("mouseleave", handleMouseLeave);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [triggerPopup]);

  const handleClaim = () => {
    setShowCode(true);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      toast.success("Code copié ! Utilisez-le au checkout.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erreur de copie, copiez manuellement: " + PROMO_CODE);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowCode(false);
    setCopied(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-gradient-to-br from-sky-50 to-blue-100">
        {/* Header with winter theme */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 p-6 text-white relative overflow-hidden">
          <Snowflake className="absolute top-2 left-4 w-6 h-6 text-white/20 animate-pulse" />
          <Snowflake className="absolute top-4 right-8 w-4 h-4 text-white/15" />
          <Snowflake className="absolute bottom-2 left-12 w-5 h-5 text-white/20" />
          <Snowflake className="absolute bottom-4 right-4 w-6 h-6 text-white/15 animate-pulse" />
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white text-center">
                ❄️ WAIT! Don't Miss This!
              </DialogTitle>
              <DialogDescription className="text-white/90 text-center text-base mt-2">
                Exclusive offer just for you
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          {!showCode ? (
            <>
              {/* Discount Badge */}
              <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg shadow-orange-500/30">
                EXTRA 10% OFF
              </div>

              <p className="text-gray-600">
                Complete your order now and get an <span className="font-bold text-sky-600">additional 10% discount</span> on your entire cart!
              </p>

              {/* Urgency */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Offer expires when you leave this page</span>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleClaim}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-6 text-lg font-bold shadow-lg shadow-blue-500/30"
                >
                  ❄️ CLAIM MY 10% OFF NOW
                </Button>
                
                <button
                  onClick={handleClose}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Promo Code Reveal */}
              <div className="space-y-4">
                <p className="text-gray-600 font-medium">
                  🎉 Here's your exclusive code:
                </p>
                
                <div 
                  onClick={handleCopyCode}
                  className="bg-gradient-to-r from-sky-100 to-blue-100 border-2 border-dashed border-sky-400 rounded-xl p-4 cursor-pointer hover:border-sky-500 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-bold text-sky-600 tracking-wider">
                      {PROMO_CODE}
                    </span>
                    {copied ? (
                      <Check className="w-6 h-6 text-green-500" />
                    ) : (
                      <Copy className="w-6 h-6 text-sky-400 group-hover:text-sky-600 transition-colors" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {copied ? "Copied!" : "Click to copy"}
                  </p>
                </div>

                <p className="text-sm text-gray-500">
                  Use this code at checkout to get <span className="font-bold text-sky-600">10% OFF</span> your order!
                </p>

                <Button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-5"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}

          {/* Trust text */}
          <p className="text-xs text-gray-400 pt-2">
            🔒 Secure checkout • Free worldwide shipping • 30-day guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
