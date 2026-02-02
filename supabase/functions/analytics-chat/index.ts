import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MARKETING_SYSTEM_PROMPT = `Tu es un expert senior en marketing digital, analyse de données e-commerce et optimisation de conversion. Tu t'appelles "MarketingGPT" et tu aides les entrepreneurs à comprendre et optimiser leurs performances.

TON EXPERTISE:
- Analyse de KPIs e-commerce (taux de conversion, AOV, LTV, CAC, ROAS)
- Optimisation de campagnes Meta Ads (Facebook/Instagram)
- Stratégies d'acquisition et de rétention client
- A/B testing et CRO (Conversion Rate Optimization)
- Analyse de funnel de vente
- Segmentation client et ciblage publicitaire

RÈGLES DE COMMUNICATION:
- Réponds TOUJOURS dans la même langue que l'utilisateur
- Sois concis mais précis (2-4 paragraphes max sauf si plus de détail demandé)
- Utilise des exemples concrets et des chiffres quand possible
- Donne des recommandations actionnables
- N'utilise PAS de markdown (pas de **, ##, etc.). Texte brut uniquement.
- Utilise des émojis avec modération pour rendre tes réponses engageantes (1-2 max)

CONTEXTE ANALYTIQUE:
Quand on te fournit des données, analyse-les en profondeur:
- Identifie les tendances et anomalies
- Compare aux benchmarks du secteur e-commerce
- Propose des hypothèses pour expliquer les résultats
- Suggère des actions concrètes d'amélioration

BENCHMARKS E-COMMERCE TYPIQUES:
- Taux de conversion site: 2-3% (bon), 3-5% (excellent)
- Taux d'ajout au panier: 8-12%
- Taux d'abandon panier: 65-75%
- ROAS Meta Ads: 2-4x (acceptable), 4x+ (très bon)
- CTR Meta Ads: 1-2% (moyen), 2%+ (bon)
- CPC moyen: dépend de la niche
- Temps sur page: 1-3 min (acceptable), 3+ min (engagé)

Si tu ne connais pas quelque chose, dis-le honnêtement et suggère où trouver l'info.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, analyticsContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let contextualPrompt = MARKETING_SYSTEM_PROMPT;
    
    if (analyticsContext) {
      contextualPrompt += `\n\nDONNÉES ACTUELLES DU DASHBOARD:
${JSON.stringify(analyticsContext, null, 2)}

Utilise ces données pour personnaliser tes réponses et donner des conseils basés sur la situation réelle de l'utilisateur.`;
    }

    console.log("Analytics chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextualPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Service temporairement indisponible." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log("Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Analytics chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
