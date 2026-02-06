import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages and popups
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const ShippingReturns = lazy(() => import("./pages/ShippingReturns"));
const AdminChat = lazy(() => import("./pages/AdminChat"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));

// Lazy load popups
const ExitIntentPopup = lazy(() => import("@/components/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })));
const UpsellModal = lazy(() => import("@/components/UpsellModal").then(m => ({ default: m.UpsellModal })));
const SocialProofPopup = lazy(() => import("@/components/SocialProofPopup").then(m => ({ default: m.SocialProofPopup })));

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  useFacebookPixel();
  useAnalyticsTracking();
  return (
    <>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/shipping" element={<ShippingReturns />} />
          <Route path="/admin/chat" element={<AdminChat />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <ExitIntentPopup />
        <UpsellModal />
        <SocialProofPopup />
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
