

# Plan : Page Produit avec Bundle Selector

## Vue d'ensemble

Transformer l'architecture pour un flow simplifié :
- **Homepage** : Un produit hero → CTA vers la page produit
- **Page produit** : Bundle selector intégré permettant de choisir entre Single Cable, Duo Pack et Family Pack

**Important** : Toutes les références au produit utiliseront "**Up to 240W**" (pas "240W" tout court).

---

## 1. Nouveau Composant : BundleSelector

### Fichier à créer : `src/components/BundleSelector.tsx`

**Design visuel :**

```text
┌────────────────────────────────────────────────────────┐
│  ⏰ Bundle deal expires in 02:34:56                    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ○  Single Cable                              $24.90   │
│    1x ChargeStand™ (Up to 240W)         was $49.90    │
│                                             [-50%]    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ○  Duo Pack                       [POPULAR] $34.90   │
│    2x ChargeStand™ (Up to 240W)         was $99.80    │
│                                             [-65%]    │
└────────────────────────────────────────────────────────┘

┌─ ✓ SELECTED ───────────────────────────────────────────┐
│ ◉  Family Pack      [BEST VALUE] [70% OFF]  $44.90   │
│    3x ChargeStand™ (Up to 240W)        was $149.70    │
│                                                        │
│                               ⭐ Most Popular Choice   │
└────────────────────────────────────────────────────────┘
```

**Comportement :**
- Pré-sélection du Family Pack par défaut
- Timer "Bundle deal expires in..." (compte à rebours minuit)
- Animation pulse sur le badge "BEST VALUE"
- Bordure différente pour l'option sélectionnée
- Le bouton Add to Cart ajoute le produit Shopify correspondant

**Options des bundles :**

| Pack | Nom affiché | Subtitle | Prix | Prix barré | Badges |
|------|-------------|----------|------|------------|--------|
| Single | Single Cable | 1x ChargeStand™ (Up to 240W) | $24.90 | $49.90 | -50% |
| Duo | Duo Pack | 2x ChargeStand™ (Up to 240W) | $34.90 | $99.80 | POPULAR, -65% |
| Family | Family Pack | 3x ChargeStand™ (Up to 240W) | $44.90 | $149.70 | BEST VALUE, 70% OFF |

---

## 2. Hook pour charger les 3 produits

### Fichier à créer : `src/hooks/useBundleProducts.ts`

Ce hook charge les 3 produits Shopify en parallèle :

```typescript
export function useBundleProducts() {
  // Charge: Single, Duo Pack, Family Pack
  // Retourne un objet avec les 3 produits mappés pour le BundleSelector
  // Gestion des états loading/error
}
```

**Produits Shopify :**
| Pack | Handle Shopify |
|------|----------------|
| Single | `chargestand-240w-90-fast-charging-cable` |
| Duo | `pack-duo-2x-chargestand™-240w` |
| Family | `pack-famille-3x-chargestand™-240w` |

---

## 3. Modifications de la Page Produit

### Fichier : `src/pages/ProductDetail.tsx`

**Changements :**

1. **Ajouter le BundleSelector** entre les badges et le bouton Add to Cart
2. **Supprimer** le sélecteur d'options classique (ou le garder si couleurs/tailles)
3. **Adapter le bouton Add to Cart** pour utiliser le produit/variant du bundle sélectionné
4. **Conserver** :
   - Le compteur de viewers actifs ✓
   - Le sticky button mobile ✓
   - Les trust badges ✓
   - Les spécifications produit ✓

**Flow utilisateur :**
1. L'utilisateur arrive sur la page produit (depuis n'importe quel handle)
2. Il voit le BundleSelector avec Family Pack pré-sélectionné
3. Il peut cliquer sur un autre pack
4. Le prix et le variant ajouté au panier changent dynamiquement

---

## 4. Simplification de la Homepage (optionnel)

### Fichier : `src/pages/Index.tsx`

**Option recommandée :** Garder les 3 cartes produits comme "teasers" qui redirigent vers la page produit unifiée.

Modification minimale :
- Les cartes pointent toutes vers `/product/chargestand` (ou le handle principal)
- Query param pour pré-sélectionner le bundle (ex: `?bundle=family`)

---

## Résumé des fichiers

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/components/BundleSelector.tsx` | Créer | Composant selector avec radio buttons stylés |
| `src/hooks/useBundleProducts.ts` | Créer | Hook pour charger les 3 produits bundle |
| `src/pages/ProductDetail.tsx` | Modifier | Intégrer BundleSelector, adapter Add to Cart |
| `src/pages/Index.tsx` | Optionnel | Simplifier navigation vers page produit unique |

---

## Détails techniques

### BundleSelector - Structure

```typescript
interface BundleOption {
  id: string;           // "single", "duo", "family"
  name: string;         // "Single Cable", "Duo Pack", "Family Pack"
  subtitle: string;     // "1x ChargeStand™ (Up to 240W)"
  price: number;
  comparePrice: number;
  discountPercent: number;
  badges: string[];
  productHandle: string;
  variantId: string;
  product: ShopifyProduct;
}

// State: selectedBundleId (default = "family")
```

### Intégration panier

```typescript
const handleAddToCart = async () => {
  const selectedBundle = bundleOptions.find(b => b.id === selectedBundleId);
  await addItem({
    product: selectedBundle.product,
    variantId: selectedBundle.variantId,
    variantTitle: selectedBundle.name,
    price: { amount: selectedBundle.price.toString(), currencyCode: "USD" },
    quantity: 1,
    selectedOptions: []
  });
};
```

### Timer Component (réutilisation)

Le timer compte jusqu'à minuit en réutilisant la même logique que le `CartDrawer`.

---

## Résultat attendu

1. **Page produit unifiée** : Un seul endroit pour choisir son pack
2. **Formulation correcte** : "Up to 240W" partout (déjà en place dans les badges existants)
3. **Upsell intégré** : Family Pack pré-sélectionné = meilleur panier moyen
4. **UX simplifiée** : Décision plus claire pour l'utilisateur
5. **Conversion optimisée** : Timer + badges créent l'urgence dans le selector

