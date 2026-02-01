import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, X, Clock, Snowflake } from "lucide-react";

const POPUP_SHOWN_KEY = "exit-intent-shown";
const POPUP_COOLDOWN_HOURS = 24;

export const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const hasRecentlyShown = useCallback(() => {
    const lastShown = localStorage.getItem(POPUP_SHOWN_KEY);
    if (!lastShown) return false;
    const hoursSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
    return hoursSinceShown < POPUP_COOLDOWN_HOURS;
  }, []);

  const markAsShown = useCallback(() => {
    localStorage.setItem(POPUP_SHOWN_KEY, Date.now().toString());
  }, []);

  useEffect(() => {
    // Only trigger on desktop (mouse leave)
    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving from the top of the page
      if (e.clientY <= 0 && !hasRecentlyShown() && !isOpen) {
        setIsOpen(true);
        markAsShown();
      }
    };

    // Mobile: trigger on back button / history navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasRecentlyShown()) {
        // Can't show popup on beforeunload, but we can try
        // This mainly helps with desktop tab close
      }
    };

    // Delay adding listener to avoid triggering immediately
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasRecentlyShown, markAsShown, isOpen]);

  const handleClaim = () => {
    // Scroll to products section
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-gradient-to-br from-sky-50 to-blue-100">
        {/* Header with winter theme */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 p-6 text-white relative overflow-hidden">
          {/* Snowflake decorations */}
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
              onClick={() => setIsOpen(false)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              No thanks, I'll pay full price
            </button>
          </div>

          {/* Trust text */}
          <p className="text-xs text-gray-400 pt-2">
            🔒 Secure checkout • Free worldwide shipping • 30-day guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
