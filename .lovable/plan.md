
# Plan : Prix du Wall Charger + Ajout dans le Hero

## 1. Augmenter le prix affiché du Wall Charger a 19.90$

**Fichier** : `src/components/WallChargerCard.tsx`

- Changer le `comparePrice` de `29.90` a `39.90` (pour garder une reduction coherente)
- Ajouter un override du prix a `19.90` au lieu du prix Shopify (actuellement ~14.90)

Alternativement, si tu veux que le prix Shopify reste la source de verite, il faudra le modifier directement dans Shopify Admin. Dis-moi ce que tu preferes -- pour ce plan je vais hardcoder 19.90.

## 2. Ajouter le Wall Charger dans le Hero

**Fichier** : `src/components/HeroSection.tsx`

- Ajouter un 4eme bouton/carte dans la grille des prix (ligne 148), a cote du Single Cable
- Passer la grille de `grid-cols-3` a `grid-cols-4` (ou `grid-cols-2 sm:grid-cols-4`)
- La carte affichera :
  - Titre : "Wall Charger"
  - Sous-titre : "240W GaN"
  - Prix barre : ~$39.90
  - Prix : $19.90
  - Badge de reduction
  - Au clic : navigation vers `/product/wall-charger-240w-gan`

## Details techniques

- La grille actuelle des prix dans le Hero contient 3 colonnes (Family, Duo, Single)
- On ajoute une 4eme colonne pour le Wall Charger avec le meme style visuel
- Sur mobile, la grille passera en 2 colonnes sur 2 lignes pour rester lisible
- Le `comparePrice` dans `WallChargerCard.tsx` sera aussi mis a jour pour correspondre
