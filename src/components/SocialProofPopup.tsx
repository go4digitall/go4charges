import { useState, useEffect, useCallback } from "react";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, X } from "lucide-react";

const NAMES = [
  "Mike", "Sarah", "John", "Emily", "David", "Jessica", "Chris", "Ashley",
  "Matt", "Jennifer", "Josh", "Amanda", "Ryan", "Stephanie", "Brandon", "Nicole",
  "Tyler", "Megan", "Kevin", "Lauren", "Justin", "Heather", "Andrew", "Rachel"
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "Austin", "Miami", "Denver", "Seattle",
  "Boston", "Atlanta", "Las Vegas", "Portland", "Nashville", "San Francisco", "Charlotte"
];

const PRODUCTS = [
  { name: "Family Pack (3x)", emoji: "👨‍👩‍👧" },
  { name: "Duo Pack (2x)", emoji: "👫" },
  { name: "ChargeStand™ 240W", emoji: "⚡" }
];

interface Notification {
  name: string;
  city: string;
  product: { name: string; emoji: string };
  minutesAgo: number;
}

const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateNotification = (): Notification => ({
  name: getRandomElement(NAMES),
  city: getRandomElement(CITIES),
  product: getRandomElement(PRODUCTS),
  minutesAgo: Math.floor(Math.random() * 10) + 1
});

export const SocialProofPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const isCartOpen = useCartStore(state => state.isOpen);

  const showNotification = useCallback(() => {
    if (isCartOpen) return;
    
    setNotification(generateNotification());
    setIsVisible(true);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 4000);
  }, [isCartOpen]);

  useEffect(() => {
    // Initial delay before first popup (20-30 seconds)
    const initialDelay = Math.random() * 10000 + 20000;
    
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    
    timeoutId = setTimeout(() => {
      showNotification();
      
      // Then show every 45-75 seconds (more authentic feel)
      intervalId = setInterval(() => {
        showNotification();
      }, Math.random() * 30000 + 45000); // 45-75s
    }, initialDelay);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [showNotification]);

  // Hide if cart opens
  useEffect(() => {
    if (isCartOpen) {
      setIsVisible(false);
    }
  }, [isCartOpen]);

  if (!isVisible || !notification) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-40 max-w-xs bg-card border border-border rounded-lg shadow-lg p-4 transition-all duration-300 ${
        isVisible ? 'animate-fade-in translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3 pr-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white">
          <ShoppingBag className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {notification.name} from {notification.city}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            just purchased {notification.product.emoji}
          </p>
          <p className="text-xs font-medium text-primary mt-1">
            {notification.product.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {notification.minutesAgo} minute{notification.minutesAgo > 1 ? 's' : ''} ago
          </p>
        </div>
      </div>
      
      {/* Verified badge */}
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
        <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-xs text-muted-foreground">Verified purchase</span>
      </div>
    </div>
  );
};
