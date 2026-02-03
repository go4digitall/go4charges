import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Site URL to crawl
const SITE_URL = "https://go4charges.com";

// Function to crawl and analyze the live site
async function crawlSite(): Promise<string> {
  console.log("Crawling site:", SITE_URL);
  
  try {
    const response = await fetch(SITE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Go4ChargesBot/1.0; CRO Analysis)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch site:", response.status);
      return "ERREUR: Impossible de crawler le site. Utilisation des données statiques.";
    }

    const html = await response.text();
    
    // Analyze the HTML content for key CRO elements
    const analysis = analyzeSiteContent(html);
    
    return analysis;
  } catch (error) {
    console.error("Crawl error:", error);
    return "ERREUR: Impossible de crawler le site. Veuillez vérifier que le site est publié.";
  }
}

function analyzeSiteContent(html: string): string {
  const lowerHtml = html.toLowerCase();
  
  // Check for trust elements
  const hasTrustBadges = lowerHtml.includes("trust") || lowerHtml.includes("secure") || lowerHtml.includes("guarantee") || lowerHtml.includes("warranty");
  const hasPaymentBadges = lowerHtml.includes("visa") || lowerHtml.includes("mastercard") || lowerHtml.includes("paypal") || lowerHtml.includes("apple pay");
  const hasCountdown = lowerHtml.includes("countdown") || lowerHtml.includes("timer") || lowerHtml.includes("ends in") || lowerHtml.includes("offer ends");
  const hasTestimonials = lowerHtml.includes("testimonial") || lowerHtml.includes("review") || lowerHtml.includes("stars") || lowerHtml.includes("rating");
  const hasFAQ = lowerHtml.includes("faq") || lowerHtml.includes("frequently asked");
  const hasFreeshipping = lowerHtml.includes("free shipping") || lowerHtml.includes("livraison gratuite");
  const hasMoneyBack = lowerHtml.includes("money back") || lowerHtml.includes("money-back") || lowerHtml.includes("30-day") || lowerHtml.includes("30 day");
  const hasChatbot = lowerHtml.includes("chatbot") || lowerHtml.includes("chat") || lowerHtml.includes("assistant");
  const hasUrgency = lowerHtml.includes("limited") || lowerHtml.includes("hurry") || lowerHtml.includes("stock") || lowerHtml.includes("clearance");
  const hasSocialProof = lowerHtml.includes("people are viewing") || lowerHtml.includes("just bought") || lowerHtml.includes("purchased");
  const hasBeforeAfter = lowerHtml.includes("before") && lowerHtml.includes("after");
  const hasVideo = lowerHtml.includes("<video") || lowerHtml.includes("video");
  const hasBundles = lowerHtml.includes("bundle") || lowerHtml.includes("pack") || (lowerHtml.includes("single") && lowerHtml.includes("duo"));
  const hasSavings = lowerHtml.includes("save") || lowerHtml.includes("% off") || lowerHtml.includes("discount");
  const hasExitIntent = lowerHtml.includes("exit") || lowerHtml.includes("don't leave") || lowerHtml.includes("wait");
  
  // Extract prices if found
  const priceMatches = html.match(/\$\d+\.?\d*/g) || [];
  const prices = [...new Set(priceMatches)].slice(0, 5);
  
  // Extract main headings
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const h1Texts = h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 3);
  
  // Check for CTAs
  const ctaPatterns = ["add to cart", "buy now", "shop now", "get yours", "order now", "checkout", "acheter", "commander"];
  const hasCTA = ctaPatterns.some(pattern => lowerHtml.includes(pattern));
  
  // Build the analysis report
  return `
ANALYSE EN TEMPS RÉEL DU SITE (crawlé le ${new Date().toISOString()}):

URL: ${SITE_URL}

ÉLÉMENTS DE CONFIANCE DÉTECTÉS:
- Badges de confiance (Trust badges): ${hasTrustBadges ? "✅ OUI" : "❌ NON"}
- Badges de paiement (Visa, PayPal...): ${hasPaymentBadges ? "✅ OUI" : "❌ NON"}
- Garantie satisfait ou remboursé: ${hasMoneyBack ? "✅ OUI" : "❌ NON"}
- Livraison gratuite mentionnée: ${hasFreeshipping ? "✅ OUI" : "❌ NON"}

ÉLÉMENTS D'URGENCE:
- Countdown/Timer: ${hasCountdown ? "✅ OUI" : "❌ NON"}
- Messages d'urgence (stock limité...): ${hasUrgency ? "✅ OUI" : "❌ NON"}

PREUVE SOCIALE:
- Témoignages/Avis clients: ${hasTestimonials ? "✅ OUI" : "❌ NON"}
- Notifications sociales (X vient d'acheter): ${hasSocialProof ? "✅ OUI" : "❌ NON"}

CONTENU:
- Images Before/After: ${hasBeforeAfter ? "✅ OUI" : "❌ NON"}
- Vidéos: ${hasVideo ? "✅ OUI" : "❌ NON"}
- FAQ: ${hasFAQ ? "✅ OUI" : "❌ NON"}
- Bundles/Packs: ${hasBundles ? "✅ OUI" : "❌ NON"}
- Économies affichées: ${hasSavings ? "✅ OUI" : "❌ NON"}

CONVERSION:
- CTA visible: ${hasCTA ? "✅ OUI" : "❌ NON"}
- Chatbot/Assistant: ${hasChatbot ? "✅ OUI" : "❌ NON"}
- Exit intent popup: ${hasExitIntent ? "✅ OUI (détecté dans le code)" : "⚠️ Non détectable par crawl (JS)"}

TITRES PRINCIPAUX DÉTECTÉS:
${h1Texts.length > 0 ? h1Texts.map(h => `- "${h}"`).join('\n') : "- Aucun H1 détecté"}

PRIX DÉTECTÉS:
${prices.length > 0 ? prices.join(', ') : "Aucun prix visible dans le HTML initial"}

NOTE: Certains éléments dynamiques (panier, popups, modales) ne sont pas visibles dans le HTML initial car ils sont générés par JavaScript. L'analyse ci-dessus reflète ce qui est dans le DOM initial.
`;
}

const RECOMMENDATIONS_PROMPT = `Tu es un expert en CRO (Conversion Rate Optimization) et en e-commerce. Tu analyses les données de performance d'un site ET l'analyse en temps réel du site pour générer des recommandations précises et actionnables.

RÈGLES CRITIQUES:
1. CONSULTE L'ANALYSE EN TEMPS RÉEL DU SITE avant de faire des recommandations
2. NE recommande PAS d'ajouter des éléments qui sont déjà présents (marqués ✅ OUI)
3. Concentre-toi sur les éléments manquants (marqués ❌ NON) ou les améliorations des éléments existants
4. Analyse les données fournies (analytics, ventes, Meta Ads)
5. Identifie les problèmes et opportunités
6. Génère 3-5 recommandations prioritaires

Pour chaque recommandation, fournis:
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
- Améliorer les éléments EXISTANTS plutôt que d'en ajouter des nouveaux

IMPORTANT: 
- Les prompts doivent être en français et très spécifiques
- Si un élément est déjà présent, propose de l'AMÉLIORER ou de le REPOSITIONNER, pas de l'ajouter
- Exemple: Si les badges de confiance existent déjà, propose de les rendre plus visibles ou de les repositionner, pas d'en ajouter

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

    // Crawl the site in real-time
    const siteAnalysis = await crawlSite();
    console.log("Site analysis completed:", siteAnalysis);

    // Build context from data
    const dataContext = `
${siteAnalysis}

---

DONNÉES ANALYTICS (période sélectionnée):
- Sessions: ${analyticsData?.sessions || 0}
- Pages vues: ${analyticsData?.pageViews || 0}
- Clics (checkout): ${analyticsData?.clicks || 0}
- Ajouts panier: ${analyticsData?.addToCart || 0}
- Temps moyen sur page: ${analyticsData?.avgTimeOnPage || 0} secondes
- Scroll depth moyen: ${analyticsData?.avgScrollDepth || 0}%
- Taux d'ajout panier: ${analyticsData?.pageViews > 0 ? ((analyticsData?.addToCart / analyticsData?.pageViews) * 100).toFixed(2) : 0}%
- Taux de conversion checkout: ${analyticsData?.addToCart > 0 ? ((analyticsData?.clicks / analyticsData?.addToCart) * 100).toFixed(2) : 0}%

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
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits AI épuisés. Ajoutez des crédits dans les paramètres." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
