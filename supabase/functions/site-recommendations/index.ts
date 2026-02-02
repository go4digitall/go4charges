import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Current site structure for context
const SITE_STRUCTURE = `
STRUCTURE DU SITE GO4CHARGES:

PAGE PRINCIPALE (/):
- Header: Logo, navigation, bouton panier sticky
- CountdownBanner: Bannière d'urgence avec timer "Winter Closeout"
- HeroSection: Image Before/After, titre principal, CTA "Shop Now"
- AsSeenSection: Logos de confiance (médias)
- BenefitsSection: Vidéo et liste des avantages du produit (90° angle, 240W, durabilité)
- TestimonialsSection: Avis clients avec photos et notes 5 étoiles
- BundleSelector: Choix des packs (Single $24.90, Duo $34.90, Family $44.90)
- TrustBadgeSection: Badges de confiance (livraison gratuite, garantie 30j, 2 ans warranty)
- FAQSection: Questions fréquentes avec accordéon
- CTASection: Call-to-action final
- Footer: Liens légaux, contact

COMPOSANTS INTERACTIFS:
- CartDrawer: Panier latéral avec produits et checkout Shopify
- ChatBot: Assistant IA "Max" pour support client
- ExitIntentPopup: Popup de rétention à la sortie
- UpsellModal: Modal d'upsell après ajout panier
- SocialProofPopup: Notifications "X vient d'acheter..."

PRODUIT:
- ChargeStand™ Premium USB-C Cable
- Prix: Single $24.90 (50% off), Duo $34.90 (65% off), Family $44.90 (70% off)
- USPs: 90° angle, 240W, 1.5m, braided nylon, 10,000+ bend cycles
`;

const RECOMMENDATIONS_PROMPT = `Tu es un expert en CRO (Conversion Rate Optimization) et en e-commerce. Tu analyses les données de performance d'un site et tu génères des recommandations précises et actionnables.

${SITE_STRUCTURE}

RÈGLES:
1. Analyse les données fournies (analytics, ventes, Meta Ads)
2. Identifie les problèmes et opportunités
3. Génère 3-5 recommandations prioritaires
4. Pour chaque recommandation, fournis:
   - Un titre clair
   - L'impact attendu (Haut/Moyen/Bas)
   - L'explication du problème détecté
   - La solution proposée
   - Un PROMPT EXACT à copier-coller pour demander la modification à Lovable

FORMAT DE RÉPONSE (JSON strict):
{
  "summary": "Résumé de l'analyse en 2-3 phrases",
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Titre de la recommandation",
      "impact": "high|medium|low",
      "problem": "Description du problème détecté basé sur les données",
      "solution": "Solution proposée en détail",
      "prompt": "Le prompt exact à donner à Lovable pour implémenter cette modification. Doit être précis et actionnable."
    }
  ]
}

TYPES DE RECOMMANDATIONS À CONSIDÉRER:
- Scroll depth faible → Repositionner le CTA, améliorer le hero
- Temps sur page court → Améliorer le hook, ajouter du contenu engageant
- Taux d'ajout panier faible → Modifier le BundleSelector, ajouter urgence
- Abandon panier élevé → Améliorer le checkout flow, ajouter réassurance
- CTR Meta faible → Suggestions pour les créatives (à implémenter sur le site)
- CPC élevé → Améliorer la landing page pour meilleur Quality Score
- ROAS faible → Optimiser le funnel de conversion
- Mobile vs Desktop écart → Optimisations responsive

IMPORTANT: Les prompts doivent être en français et très spécifiques. Exemple:
"Modifie le HeroSection pour ajouter un badge 'Livraison GRATUITE' sous le titre principal, et change le texte du CTA de 'Shop Now' à 'Commander maintenant - Livraison offerte'"

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analyticsData, salesData, metaAdsData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from data
    const dataContext = `
DONNÉES ANALYTICS (période sélectionnée):
- Sessions: ${analyticsData?.sessions || 0}
- Pages vues: ${analyticsData?.pageViews || 0}
- Clics: ${analyticsData?.clicks || 0}
- Ajouts panier: ${analyticsData?.addToCart || 0}
- Temps moyen sur page: ${analyticsData?.avgTimeOnPage || 0} secondes
- Scroll depth moyen: ${analyticsData?.avgScrollDepth || 0}%
- Taux d'ajout panier: ${analyticsData?.pageViews > 0 ? ((analyticsData?.addToCart / analyticsData?.pageViews) * 100).toFixed(2) : 0}%

DONNÉES VENTES:
- Revenu total: $${salesData?.totalRevenue?.toFixed(2) || 0}
- Nombre de commandes: ${salesData?.totalOrders || 0}
- Panier moyen (AOV): $${salesData?.avgOrderValue?.toFixed(2) || 0}

${metaAdsData ? `DONNÉES META ADS:
- Impressions: ${metaAdsData.impressions}
- Clics: ${metaAdsData.clicks}
- CTR: ${metaAdsData.ctr}%
- CPC: $${metaAdsData.cpc}
- Dépenses: $${metaAdsData.spend}
- Conversions: ${metaAdsData.conversions}
- ROAS: ${metaAdsData.roas}x
- Coût par conversion: $${metaAdsData.conversions > 0 ? (metaAdsData.spend / metaAdsData.conversions).toFixed(2) : 'N/A'}` : 'DONNÉES META ADS: Non importées'}
`;

    console.log("Generating recommendations with context:", dataContext);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: RECOMMENDATIONS_PROMPT },
          { role: "user", content: dataContext },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON response
    let recommendations;
    try {
      // Clean up potential markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse recommendations:", content);
      throw new Error("Invalid recommendations format");
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
