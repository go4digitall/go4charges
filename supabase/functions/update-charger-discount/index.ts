import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_RULE_ID = 1750585672043;
const CHARGER_UNIT_PRICE = 24.90;
const SHOPIFY_STORE = "go4charges.myshopify.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chargerCount } = await req.json();
    
    if (!chargerCount || chargerCount < 1) {
      return new Response(JSON.stringify({ error: "Invalid charger count" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const discountValue = -(CHARGER_UNIT_PRICE * chargerCount);
    const accessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    
    if (!accessToken) {
      throw new Error("Missing SHOPIFY_ACCESS_TOKEN");
    }

    const response = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-01/price_rules/${PRICE_RULE_ID}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          price_rule: {
            id: PRICE_RULE_ID,
            value: discountValue.toString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API error:", errorText);
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        value: data.price_rule.value,
        chargerCount 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating charger discount:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
