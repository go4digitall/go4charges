

# Orienter le site Go4Charges vers le Canada uniquement

## Résumé
Remplacer toutes les mentions "Worldwide", "USD", et références aux autres pays par du contenu ciblant exclusivement le Canada. La boutique Shopify Canada sera connectée plus tard par l'utilisateur.

## Changements par fichier

### 1. Mentions "Worldwide" → "Canada 🇨🇦"

| Fichier | Avant | Après |
|---------|-------|-------|
| `src/pages/Index.tsx` | "Free Shipping Worldwide" | "Free Shipping Across Canada 🇨🇦" |
| `src/components/CTASection.tsx` | "FREE Worldwide Shipping" | "FREE Shipping to Canada 🇨🇦" |
| `src/components/ChargerUpsellModal.tsx` | "FREE worldwide shipping" | "FREE shipping across Canada" |
| `src/components/ExitIntentPopup.tsx` | "Free worldwide shipping" | "Free shipping across Canada 🇨🇦" |
| `src/pages/ProductDetail.tsx` | "Worldwide delivery" | "Ships across Canada 🇨🇦" |
| `src/components/HeroSection.tsx` | "Free Shipping" (trust badge) | "Free Shipping 🇨🇦" |
| `src/components/TrustBadgeSection.tsx` | "FREE Shipping" | "FREE Shipping 🇨🇦" |
| `src/components/CartDrawer.tsx` | "FREE Shipping" | "FREE Shipping 🇨🇦" |
| `src/pages/ShippingReturns.tsx` | "Free Shipping - On all orders" | "Free Shipping - Across Canada" |

### 2. Devise USD → CAD

| Fichier | Changement |
|---------|-----------|
| `src/pages/ProductDetail.tsx` | `currency: 'USD'` → `currency: 'CAD'` (2 occurrences Facebook Pixel) |
| `src/components/WallChargerCard.tsx` | `currencyCode || "USD"` → `currencyCode || "CAD"` |
| `src/pages/TermsConditions.tsx` | "All prices are displayed in USD" → "All prices are displayed in CAD" |

### 3. Page Shipping & Returns
- Retirer les lignes United States, Europe, Australia, Rest of World
- Garder uniquement **Canada: 7-10 business days**
- Changer "We ship worldwide" → "We ship across Canada"

### 4. FAQ Section
- Question "Do you ship internationally?" → "Where do you ship?"
- Réponse : "We ship across Canada with FREE shipping on all orders. Delivery typically takes 7-10 business days."
- Question "Winter Clearance" : garder telle quelle (promo indépendante de la géo)

### 5. Chatbot (Edge Function)
- `supabase/functions/chat/index.ts` : mettre à jour le system prompt pour mentionner Canada uniquement et délais 7-10 jours

### Note importante
La boutique Shopify actuelle reste connectée pour l'instant. L'utilisateur créera une boutique Shopify Canada séparée et la connectera plus tard. Les prix affichés via le Storefront API refléteront la devise configurée dans cette nouvelle boutique.

