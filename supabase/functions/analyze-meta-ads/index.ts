import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MetaAdsData {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  campaigns: Array<{
    name: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
}

const ANALYSIS_PROMPT = `Tu es un expert en Meta Ads et acquisition payante. Analyse les données publicitaires fournies et génère un rapport détaillé avec des recommandations actionnables.

CONTEXTE:
- Tu analyses les performances de campagnes Meta (Facebook/Instagram) pour un site e-commerce de chargeurs sans fil
- L'objectif est d'optimiser le ROAS (Return On Ad Spend) et réduire le CPC
- Le produit se vend entre $25 et $60

BENCHMARKS DU SECTEUR:
- CTR moyen e-commerce: 1-2%
- CPC moyen: $0.50-$1.50
- Taux de conversion: 2-5%
- ROAS cible: 2x minimum, 3x+ excellent

ANALYSE REQUISE:
1. Évalue la performance globale (score: good/warning/critical)
2. Identifie 2-4 insights clés (succès, alertes, opportunités)
3. Génère 2-3 recommandations prioritaires avec actions concrètes
4. Si données de comparaison fournies, calcule l'évolution

FORMAT DE RÉPONSE (JSON strict):
{
  "summary": "Résumé en 1-2 phrases de la performance globale",
  "score": "good|warning|critical",
  "insights": [
    {
      "type": "success|warning|improvement",
      "title": "Titre court",
      "description": "Explication détaillée"
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "title": "Action recommandée",
      "action": "Description détaillée de l'action à prendre"
    }
  ]
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentData, previousData } = await req.json() as {
      currentData: MetaAdsData;
      previousData: MetaAdsData | null;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build data context
    const conversionRate = currentData.clicks > 0 
      ? ((currentData.conversions / currentData.clicks) * 100).toFixed(2) 
      : "0";
    const costPerConversion = currentData.conversions > 0 
      ? (currentData.spend / currentData.conversions).toFixed(2) 
      : "N/A";

    let dataContext = `
DONNÉES ACTUELLES:
- Impressions: ${currentData.impressions.toLocaleString()}
- Clics: ${currentData.clicks.toLocaleString()}
- Dépenses: $${currentData.spend.toFixed(2)}
- Conversions: ${currentData.conversions}
- CTR: ${currentData.ctr}%
- CPC: $${currentData.cpc}
- ROAS: ${currentData.roas}x
- Taux de conversion: ${conversionRate}%
- Coût par conversion: $${costPerConversion}
`;

    if (currentData.campaigns && currentData.campaigns.length > 0) {
      dataContext += `
TOP CAMPAGNES:
${currentData.campaigns.slice(0, 5).map((c, i) => 
  `${i + 1}. ${c.name}: $${c.spend.toFixed(2)} dépensés, ${c.conversions} conversions`
).join('\n')}
`;
    }

    if (previousData) {
      const spendChange = previousData.spend > 0 
        ? ((currentData.spend - previousData.spend) / previousData.spend * 100).toFixed(1)
        : "N/A";
      const roasChange = previousData.roas > 0 
        ? ((currentData.roas - previousData.roas) / previousData.roas * 100).toFixed(1)
        : "N/A";
      const cpcChange = previousData.cpc > 0 
        ? ((currentData.cpc - previousData.cpc) / previousData.cpc * 100).toFixed(1)
        : "N/A";

      dataContext += `
COMPARAISON AVEC IMPORT PRÉCÉDENT:
- Évolution dépenses: ${spendChange}%
- Évolution ROAS: ${roasChange}%
- Évolution CPC: ${cpcChange}%
- Évolution conversions: ${previousData.conversions > 0 
  ? ((currentData.conversions - previousData.conversions) / previousData.conversions * 100).toFixed(1) 
  : "N/A"}%
`;
    }

    console.log("Analyzing Meta Ads data:", dataContext);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: dataContext },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
    let analysis;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse analysis:", content);
      throw new Error("Invalid analysis format");
    }

    // Add comparison data if available
    if (previousData) {
      analysis.comparison = {
        vsLastImport: {
          spendChange: previousData.spend > 0 ? ((currentData.spend - previousData.spend) / previousData.spend) * 100 : 0,
          roasChange: previousData.roas > 0 ? ((currentData.roas - previousData.roas) / previousData.roas) * 100 : 0,
          cpcChange: previousData.cpc > 0 ? ((currentData.cpc - previousData.cpc) / previousData.cpc) * 100 : 0,
          conversionsChange: previousData.conversions > 0 ? ((currentData.conversions - previousData.conversions) / previousData.conversions) * 100 : 0,
        },
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
