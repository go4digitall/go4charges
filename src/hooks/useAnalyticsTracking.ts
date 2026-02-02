import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'analytics_session_id';

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

interface EventData {
  [key: string]: string | number | boolean | null | undefined;
}

export const useAnalyticsTracking = () => {
  const sessionId = useRef(getSessionId());
  const startTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const hasTrackedPageView = useRef(false);

  const trackEvent = useCallback(async (eventType: string, eventData: EventData = {}) => {
    try {
      await supabase.from('analytics_events').insert({
        session_id: sessionId.current,
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, []);

  // Track page view
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      trackEvent('page_view', {
        referrer: document.referrer,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
      });
    }
  }, [trackEvent]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
        
        // Track at 25%, 50%, 75%, 90% thresholds
        const thresholds = [25, 50, 75, 90];
        thresholds.forEach(threshold => {
          if (scrollPercent >= threshold && maxScrollDepth.current < threshold + 5) {
            trackEvent('scroll_depth', { depth: threshold });
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent]);

  // Track time on page when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      // Use sendBeacon for reliable tracking on page exit
      const data = JSON.stringify({
        session_id: sessionId.current,
        event_type: 'page_exit',
        event_data: { 
          time_spent_seconds: timeSpent,
          max_scroll_depth: maxScrollDepth.current 
        },
        page_url: window.location.pathname,
        device_type: getDeviceType(),
      });
      
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics_events`,
        new Blob([data], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track specific user actions
  const trackClick = useCallback((elementName: string, elementType: string = 'button') => {
    trackEvent('click', { element_name: elementName, element_type: elementType });
  }, [trackEvent]);

  const trackAddToCart = useCallback((productName: string, bundleType: string, price: number) => {
    trackEvent('add_to_cart', { product_name: productName, bundle_type: bundleType, price });
  }, [trackEvent]);

  const trackCheckoutStart = useCallback(() => {
    trackEvent('checkout_start', {});
  }, [trackEvent]);

  const trackSectionView = useCallback((sectionName: string) => {
    trackEvent('section_view', { section_name: sectionName });
  }, [trackEvent]);

  return {
    trackEvent,
    trackClick,
    trackAddToCart,
    trackCheckoutStart,
    trackSectionView,
  };
};

// Export a standalone function for use outside of React components
export const trackAnalyticsEvent = async (eventType: string, eventData: EventData = {}) => {
  const sessionId = getSessionId();
  try {
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData,
      page_url: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};
