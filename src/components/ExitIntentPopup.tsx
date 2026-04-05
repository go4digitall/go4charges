import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Clock, Zap, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";

const POPUP_SHOWN_KEY = "exit-intent-shown";
const POPUP_COOLDOWN_HOURS = 24;
const PROMO_CODE = "PROMO10";

export const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { isOpen: isCartOpen, items } = useCartStore();
  const wasCartOpen = useRef(false);
  const hasTriggeredMouseLeave = useRef(false);

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
      console.log('[ExitIntent] Triggering popup!');
      setIsOpen(true);
      markAsShown();
    }
  }, [hasRecentlyShown, isOpen, markAsShown]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggeredMouseLeave.current) {
        hasTriggeredMouseLeave.current = true;
        triggerPopup();
      }
    };
    const isDesktop = !('ontouchstart' in window);
    if (isDesktop) document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [triggerPopup]);

  useEffect(() => {
    let timeOnPage = 0;
    const minTimeBeforeTrigger = 10000;
    const interval = setInterval(() => { timeOnPage += 1000; }, 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && timeOnPage >= minTimeBeforeTrigger) triggerPopup();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', handleVisibilityChange); };
  }, [triggerPopup]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let hasScrolledDown = false;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = currentScrollY - lastScrollY;
      if (currentScrollY > 300) hasScrolledDown = true;
      if (hasScrolledDown && velocity < -50 && currentScrollY < 100) {
        triggerPopup();
        hasScrolledDown = false;
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerPopup]);

  useEffect(() => {
    if (wasCartOpen.current && !isCartOpen) {
      if (items.length > 0 && !hasRecentlyShown() && !isOpen) {
        setTimeout(() => triggerPopup(), 300);
      }
    }
    wasCartOpen.current = isCartOpen;
  }, [isCartOpen, items.length, hasRecentlyShown, isOpen, triggerPopup]);

  const handleClaim = () => setShowCode(true);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      toast.success("Code copied! Use it at checkout.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy error, manually copy: " + PROMO_CODE);
    }
  };

  const handleClose = () => { setIsOpen(false); setShowCode(false); setCopied(false); };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-border bg-background">
        {/* Header */}
        <div className="bg-foreground p-6 text-white relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white text-center">
                ⚡ WAIT! Don't Miss This!
              </DialogTitle>
              <DialogDescription className="text-white/80 text-center text-base mt-2">
                Exclusive offer just for you
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 text-center space-y-4">
          {!showCode ? (
            <>
              <div className="inline-block bg-primary text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg shadow-primary/20">
                EXTRA 10% OFF
              </div>
              <p className="text-muted-foreground">
                Complete your order now and get an <span className="font-bold text-foreground">additional 10% discount</span> on your entire cart!
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Offer expires when you leave this page</span>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleClaim}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold shadow-lg shadow-primary/20"
                >
                  ⚡ CLAIM MY 10% OFF NOW
                </Button>
                <button onClick={handleClose} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  No thanks, I'll pay full price
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground font-medium">🎉 Here's your exclusive code:</p>
              <div 
                onClick={handleCopyCode}
                className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-primary tracking-wider">{PROMO_CODE}</span>
                  {copied ? <Check className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors" />}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{copied ? "Copied!" : "Click to copy"}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this code at checkout to get <span className="font-bold text-primary">10% OFF</span> your order!
              </p>
              <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90 text-white py-5">
                Continue Shopping
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-2">
            🔒 Secure checkout • Free shipping across Canada 🇨🇦 • 30-day guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
