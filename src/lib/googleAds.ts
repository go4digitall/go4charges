// Google Ads Conversion ID
export const GOOGLE_ADS_ID = 'AW-18049115807';
export const GOOGLE_ADS_CONVERSION_LABEL = 'AW-18049115807/0phICPCu55EcEJ_Nvp5D';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Initialize Google Ads gtag
export const initGoogleAds = (): void => {
  if (typeof window === 'undefined') return;
  if (window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GOOGLE_ADS_ID);
};

// Track AddToCart event
export const trackGoogleAddToCart = (value: number, currency: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', { value, currency });
  }
};

// Track BeginCheckout event
export const trackGoogleCheckout = (value: number, currency: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', { value, currency });
  }
};

// Track Purchase conversion (for future use / Shopify-side)
export const trackGoogleConversion = (value: number, currency: string, transactionId: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: GOOGLE_ADS_CONVERSION_LABEL,
      value,
      currency,
      transaction_id: transactionId,
    });
  }
};
