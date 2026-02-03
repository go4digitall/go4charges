
# Plan : Ajouter le ChargeStand™ USB-C vers Lightning

## Contexte
Tu souhaites proposer la même gamme ChargeStand™ mais avec une connexion **USB-C vers Lightning** pour les utilisateurs d'iPhone 14 et antérieurs (iPhone 5 à 14, SE, iPad avec port Lightning).

---

## Ce que je vais faire

### 1. Créer les 3 produits Lightning dans Shopify

| Produit | Prix | Prix barré | Réduction |
|---------|------|------------|-----------|
| **Single Cable (Lightning)** | $24.90 | $49.90 | -50% |
| **Duo Pack (Lightning)** | $34.90 | $99.80 | -65% |
| **Family Pack (Lightning)** | $44.90 | $149.70 | -70% |

- Utilisation de la même image que le câble USB-C single actuel
- Titre incluant "Lightning" pour différencier
- Description adaptée mentionnant la compatibilité iPhone 5-14

### 2. Ajouter un sélecteur de type de câble sur le site

**Sur la page produit (`ProductDetail.tsx`)** :
- Nouveau composant de sélection "Type de câble" avec deux options visuelles :
  - **USB-C vers USB-C** : "For iPhone 15+, MacBook, iPad Pro, Android"
  - **USB-C vers Lightning** : "For iPhone 5-14, iPad, AirPods"
- Le sélecteur de bundles s'adapte au type choisi
- URL avec paramètre `?type=lightning` ou `?type=usbc`

**Sur la page d'accueil (`HeroSection.tsx`)** :
- Ajout d'un indicateur visuel "Also available for Lightning (iPhone 5-14)" sous les prix
- Lien direct vers la version Lightning

### 3. Mettre à jour le hook `useBundleProducts`

- Nouveau hook `useBundleProductsWithType(type: 'usbc' | 'lightning')`
- Configuration des handles Shopify pour les deux gammes
- Gestion des deux sets de produits

---

## Structure visuelle du sélecteur

```text
┌─────────────────────────────────────────────────────────┐
│  Choisissez votre type de câble :                       │
├──────────────────────┬──────────────────────────────────┤
│  ⚡ USB-C to USB-C   │  🍎 USB-C to Lightning           │
│  ─────────────────   │  ─────────────────               │
│  iPhone 15+          │  iPhone 5-14                     │
│  MacBook, iPad Pro   │  iPad, AirPods                   │
│  Android devices     │                                  │
│  [SELECTED]          │                                  │
└──────────────────────┴──────────────────────────────────┘
```

---

## Fichiers concernés

| Fichier | Modification |
|---------|--------------|
| **Shopify** | Création de 3 nouveaux produits Lightning |
| `src/hooks/useBundleProducts.ts` | Ajout des handles Lightning + logique type |
| `src/pages/ProductDetail.tsx` | Sélecteur de type + URL params |
| `src/components/HeroSection.tsx` | Indicateur "Also for Lightning" |
| `src/components/BundleSelector.tsx` | Affichage du type sélectionné |

---

## Détails techniques

### Nouveaux produits Shopify à créer
1. `chargestand-lightning-240w` - Single Cable Lightning ($24.90)
2. `pack-duo-2x-chargestand-lightning-240w` - Duo Pack Lightning ($34.90)
3. `pack-famille-3x-chargestand-lightning-240w` - Family Pack Lightning ($44.90)

### Structure des handles dans le hook
```typescript
const BUNDLE_HANDLES = {
  usbc: {
    single: 'chargestand-240w-90-fast-charging-cable',
    duo: 'pack-duo-2x-chargestand™-240w',
    family: 'pack-famille-3x-chargestand™-240w',
  },
  lightning: {
    single: 'chargestand-lightning-240w',
    duo: 'pack-duo-2x-chargestand-lightning-240w',
    family: 'pack-famille-3x-chargestand-lightning-240w',
  },
};
```

### Paramètres URL
- `/product/chargestand?type=usbc&bundle=family` (défaut)
- `/product/chargestand?type=lightning&bundle=family`

---

## Résultat attendu

✅ 3 nouveaux produits Lightning dans Shopify  
✅ Sélecteur de type de câble visible et intuitif  
✅ Compatibilité iPhone clairement affichée  
✅ Même structure de prix et bundles  
✅ Navigation fluide entre les deux versions

