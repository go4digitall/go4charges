// Facebook Pixel IDs - Multiple markets
export const FB_PIXEL_IDS = {
  US: '661610226976532',
  UK: '1354309796450965',
};

// All pixel IDs as array for iteration
const ALL_PIXEL_IDS = Object.values(FB_PIXEL_IDS);

// Declare fbq on window
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

// Initialize Facebook Pixels (all markets)
export const initFacebookPixel = (): void => {
  if (typeof window === 'undefined') return;
  
  // Check if already initialized
  if (window.fbq) return;

  // Facebook Pixel base code
  const f = window;
  const b = document;
  const e = 'script';
  
  const n = function(...args: unknown[]) {
    if ((n as { callMethod?: (...args: unknown[]) => void }).callMethod) {
      (n as { callMethod: (...args: unknown[]) => void }).callMethod(...args);
    } else {
      (n as { queue: unknown[] }).queue.push(args);
    }
  } as Window['fbq'] & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; push: (...args: unknown[]) => void; loaded: boolean; version: string };
  
  if (!f.fbq) {
    f.fbq = n;
  }
  
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  
  const script = b.createElement(e) as HTMLScriptElement;
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  
  const firstScript = b.getElementsByTagName(e)[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  // Initialize ALL pixels
  ALL_PIXEL_IDS.forEach(pixelId => {
    window.fbq('init', pixelId);
  });
  
  // Track initial PageView for all pixels
  window.fbq('track', 'PageView');
};

// Track PageView event (fires for all pixels)
export const trackPageView = (): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Track ViewContent event (product view)
export const trackViewContent = (params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', params);
  }
};

// Track AddToCart event
export const trackAddToCart = (params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', params);
  }
};

// Track InitiateCheckout event
export const trackInitiateCheckout = (params: {
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
  num_items: number;
}): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', params);
  }
};

// Track Purchase event
export const trackPurchase = (params: {
  content_name?: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
  num_items: number;
}): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', params);
  }
};
