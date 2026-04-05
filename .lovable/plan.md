

## Mise à jour du Pixel Meta

Remplacer l'ID du pixel Facebook actuel (`661610226976532`) par le nouveau `197273290668251`.

### Fichiers à modifier

1. **`src/lib/facebookPixel.ts`** — Changer `FB_PIXEL_ID` de `'661610226976532'` à `'197273290668251'`

2. **`index.html`** — Ajouter le fallback `<noscript>` dans le `<body>` pour que le pixel fonctionne même sans JavaScript :
```html
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=197273290668251&ev=PageView&noscript=1" />
</noscript>
```

Deux modifications simples, aucun changement de logique.

