

# Plan : Implémentation de 4 Fonctionnalités de Conversion

## Vue d'ensemble

Ce plan couvre l'implémentation de 4 fonctionnalités pour améliorer le taux de conversion :

1. **Pop-ups de Preuve Sociale** - Notifications discrètes "X vient d'acheter..."
2. **Sticky Add-to-Cart Mobile** - Bouton flottant sur la page produit
3. **Indicateur de Stock Limité** - Barre de progression + "Only X left"
4. **Compteur de Visiteurs Actifs** - "X personnes regardent ce produit"

---

## 1. Pop-ups de Preuve Sociale

Notifications discrètes en bas de l'écran montrant des achats récents fictifs.

**Comportement :**
- Apparaît toutes les 15-30 secondes (aléatoire)
- Affiche un prénom + ville aléatoire + produit
- Animation de slide-in depuis le bas gauche
- Disparaît après 4 secondes
- Ne s'affiche pas si le panier est ouvert

**Exemple visuel :**
```text
+------------------------------------------+
| 🛒 Marie from Paris just purchased       |
|    Family Pack (3x) • 2 minutes ago      |
+------------------------------------------+
```

**Fichier à créer :**
- `src/components/SocialProofPopup.tsx`

**Fichier à modifier :**
- `src/App.tsx` - Ajouter le composant global

---

## 2. Sticky Add-to-Cart Mobile

Bouton flottant en bas de l'écran sur mobile quand l'utilisateur scroll vers le bas sur la page produit.

**Comportement :**
- Visible uniquement sur mobile (< 768px)
- Apparaît quand le bouton original sort de l'écran
- Affiche le prix + bouton "Add to Cart"
- Animation de slide-up smooth

**Exemple visuel :**
```text
+----------------------------------------+
| $29.90        [❄️ ADD TO CART]         |
+----------------------------------------+
```

**Fichier à modifier :**
- `src/pages/ProductDetail.tsx` - Ajouter le sticky button avec détection de scroll

---

## 3. Indicateur de Stock Limité

Barre de progression et message "Only X left" sur les cartes produit.

**Comportement :**
- Stock simulé entre 3 et 15 unités (basé sur product ID pour cohérence)
- Barre de progression rouge/orange selon urgence
- Badge "Low Stock" si < 5 unités
- Message "Only X left in stock!"

**Exemple visuel :**
```text
+------------------------------------------+
| ⚠️ Only 7 left in stock!                 |
| [████████░░░░░░░░] 47% remaining         |
+------------------------------------------+
```

**Fichier à modifier :**
- `src/components/ProductCard.tsx` - Ajouter l'indicateur de stock

---

## 4. Compteur de Visiteurs Actifs

Nombre de personnes "regardant" le produit en temps réel (simulé).

**Comportement :**
- Affiché sur la page produit uniquement
- Nombre entre 12 et 47 (fluctue légèrement toutes les 30s)
- Icône d'œil animée
- Message : "X people are viewing this right now"

**Exemple visuel :**
```text
+------------------------------------------+
| 👁️ 23 people are viewing this right now  |
+------------------------------------------+
```

**Fichier à modifier :**
- `src/pages/ProductDetail.tsx` - Ajouter le compteur de viewers

---

## Résumé des Modifications

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/components/SocialProofPopup.tsx` | Créer | Nouveau composant pour les notifications d'achat |
| `src/App.tsx` | Modifier | Intégrer SocialProofPopup globalement |
| `src/components/ProductCard.tsx` | Modifier | Ajouter indicateur de stock limité |
| `src/pages/ProductDetail.tsx` | Modifier | Ajouter sticky button mobile + compteur viewers |

---

## Détails Techniques

### SocialProofPopup.tsx

```typescript
// Données simulées
const NAMES = ["Marie", "Sophie", "Pierre", "Lucas", "Emma", "Thomas", ...];
const CITIES = ["Paris", "Lyon", "London", "Berlin", "New York", "Toronto", ...];
const PRODUCTS = ["Family Pack (3x)", "Duo Pack (2x)", "ChargeStand™ 240W"];

// Hook useInterval pour timing aléatoire (15-30s)
// State: isVisible, currentNotification
// Animation: animate-in slide-in-from-bottom + fade-out
```

### Stock Limité (ProductCard)

```typescript
// Génération déterministe du stock basée sur product ID
const getStockLevel = (productId: string) => {
  const hash = productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 3 + (hash % 13); // Entre 3 et 15
};

// Couleur de la barre selon le niveau
// < 5: red, < 10: orange, >= 10: green
```

### Sticky Button (ProductDetail)

```typescript
// Hook useInView ou IntersectionObserver
// Détecte quand le bouton original sort de l'écran
// Position: fixed bottom-0, z-50
// Affichage conditionnel: isMobile && !isButtonVisible
```

### Compteur Viewers (ProductDetail)

```typescript
// État initial: Math.floor(12 + Math.random() * 35)
// useEffect avec setInterval toutes les 30s
// Fluctuation: ±1-3 personnes pour effet réaliste
```

---

## Résultat Attendu

- **Preuve sociale** : Crée un sentiment de popularité et d'urgence
- **Sticky button** : Réduit la friction sur mobile (pas besoin de scroller)
- **Stock limité** : Urgence visuelle incitant à l'achat immédiat
- **Viewers actifs** : Effet de troupeau ("si d'autres regardent, c'est bien")

