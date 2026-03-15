

# Ajouter le Canada comme marché de vente

## Changements nécessaires

Le site mentionne déjà le Canada dans la page Shipping & Returns (délais 8-12 jours). Il faut vérifier s'il y a des restrictions géographiques ailleurs dans le code ou la configuration.

### Fichiers à vérifier/modifier

1. **`src/pages/ShippingReturns.tsx`** — Le Canada est déjà listé dans les délais de livraison. Aucun changement requis ici.

2. **Shopify Admin** — Vérifier que le Canada est activé comme marché de vente (Markets) et que les zones d'expédition (Shipping Zones) incluent le Canada. Cela doit être fait manuellement dans le Shopify Admin.

3. **Recherche dans le code** — Vérifier s'il y a des restrictions de pays codées en dur (filtres sur "US only", etc.) dans le checkout ou ailleurs.

### Actions

1. Rechercher dans le codebase toute mention de restriction géographique (US-only, country filter, etc.)
2. Si des restrictions existent, les mettre à jour pour inclure le Canada
3. Rappeler à l'utilisateur de configurer le Canada dans Shopify Admin (Markets + Shipping Zones)

### Note importante

Les Markets et Shipping Zones doivent être configurés manuellement dans le Shopify Admin — ce n'est pas faisable via l'API. L'utilisateur devra :
- Aller dans **Shopify Admin → Settings → Markets** et ajouter le Canada
- Aller dans **Shopify Admin → Settings → Shipping and delivery** et ajouter une zone Canada

