import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initFacebookPixel, trackPageView } from '@/lib/facebookPixel';

export const useFacebookPixel = () => {
  const location = useLocation();

  // Initialize pixel on mount
  useEffect(() => {
    initFacebookPixel();
  }, []);

  // Track page views on route change
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);
};
