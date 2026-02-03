
# Plan d'Optimisation PageSpeed - Go4Charges

## Analyse des Problèmes Identifiés

Après analyse du code, voici les principaux problèmes qui impactent les scores PageSpeed mobile:

### 1. Images Non Optimisées
- **Hero image** (`hero-before-after.jpg`): Pas de `loading="lazy"`, pas de `fetchpriority="high"`
- **Vidéos autoplay** dans BenefitsSection: 2 vidéos MP4 se chargent immédiatement
- **Images testimonials** (AVIF): Aucun lazy loading
- **Images produits**: Pas d'optimisation du chargement

### 2. Largest Contentful Paint (LCP) - Critique
- L'image Hero est l'élément LCP mais n'a pas `fetchpriority="high"`
- Pas de preload pour les ressources critiques dans `index.html`

### 3. JavaScript Bloquant
- Aucun lazy loading des composants (pas de `React.lazy()`)
- Toutes les sections se chargent immédiatement

### 4. Cumulative Layout Shift (CLS)
- Images sans dimensions explicites sur certains composants
- Polices web sans `font-display: swap`

### 5. Animations Coûteuses
- Snowflakes avec animations CSS continues (15 flocons)
- Marquee animations dans plusieurs sections

---

## Plan d'Implémentation

### Phase 1: Optimisations Critiques (LCP & FCP)

**1.1 Preload des Ressources Critiques**
Modifier `index.html` pour ajouter:
- Preload de l'image Hero
- Preload de la police principale
- Preconnect aux domaines externes (Shopify CDN)

**1.2 Hero Image - Priorité Haute**
Modifier `HeroSection.tsx`:
- Ajouter `fetchpriority="high"` sur l'image Hero
- Ajouter `loading="eager"` (opposé de lazy)
- Garder les dimensions explicites existantes

**1.3 Optimisation des Vidéos**
Modifier `BenefitsSection.tsx`:
- Ajouter `preload="none"` ou `preload="metadata"` sur les vidéos
- Utiliser l'attribut `poster` avec une image statique
- Ne charger les vidéos que quand visibles (Intersection Observer)

### Phase 2: Lazy Loading des Images

**2.1 Images Below the Fold**
Ajouter `loading="lazy"` sur:
- `BenefitsSection.tsx`: Image banner
- `TestimonialsSection.tsx`: Avatars et images produits
- `ProductCard.tsx`: Images produits Shopify
- `Footer.tsx`: Logo et badges de paiement

**2.2 Images avec Dimensions Explicites**
Ajouter `width` et `height` sur toutes les images pour éviter le CLS

### Phase 3: Code Splitting & Lazy Loading des Composants

**3.1 Lazy Load des Sections Non-Critiques**
Modifier `App.tsx` et `Index.tsx`:
- Utiliser `React.lazy()` pour les pages secondaires
- Lazy load des composants below-the-fold:
  - `FAQSection`
  - `TestimonialsSection`
  - `ChatBot`
  - `ExitIntentPopup`
  - `UpsellModal`
  - `SocialProofPopup`

### Phase 4: Réduction des Animations

**4.1 Simplifier les Snowflakes**
Modifier `HeroSection.tsx`:
- Réduire de 15 à 5 flocons sur mobile
- Utiliser `will-change: transform` pour optimiser le GPU
- Désactiver les animations sur `prefers-reduced-motion`

**4.2 Optimiser les Marquees**
- Utiliser `will-change: transform` sur les éléments animés
- Pause des animations quand hors viewport

### Phase 5: Optimisations HTML & Métadonnées

**5.1 index.html**
```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>

<!-- Preload critical hero image -->
<link rel="preload" as="image" href="/src/assets/hero-before-after.jpg" fetchpriority="high">

<!-- Font display swap -->
<style>
  @font-face {
    font-display: swap;
  }
</style>
```

---

## Résumé des Fichiers à Modifier

| Fichier | Modifications |
|---------|---------------|
| `index.html` | Preload, preconnect, font-display |
| `src/components/HeroSection.tsx` | fetchpriority, réduction snowflakes |
| `src/components/BenefitsSection.tsx` | Lazy video, poster images |
| `src/components/TestimonialsSection.tsx` | Lazy loading images |
| `src/components/ProductCard.tsx` | Lazy loading + dimensions |
| `src/components/Footer.tsx` | Lazy loading |
| `src/pages/Index.tsx` | React.lazy pour sections |
| `src/App.tsx` | React.lazy pour pages & popups |
| `src/index.css` | will-change, reduced-motion |

---

## Impact Attendu

| Métrique | Avant (estimé) | Après (cible) |
|----------|----------------|---------------|
| LCP | > 4s | < 2.5s |
| FCP | > 2s | < 1.8s |
| TBT | Élevé | Réduit de 40% |
| CLS | Variable | < 0.1 |
| Performance Score | ~40-60 | ~75-85 |

