import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Site content for the AI to use as context
const SITE_CONTEXT = `
You are a helpful customer support assistant for Go4Charges, an online store selling premium USB-C charging cables called ChargeStand™.

IMPORTANT RULES:
- Respond in the SAME LANGUAGE as the user's question. If they ask in French, answer in French. If Spanish, answer in Spanish. Default to American English.
- Keep responses SHORT and CONCISE (2-4 sentences max unless more detail is specifically asked).
- Be friendly, helpful, and professional.
- Do NOT use markdown formatting (no **, no ##, no bullets with *, no code blocks). Use plain text only.
- If you don't know something specific, direct users to contact@go4charges.com

PRODUCT INFORMATION:
- Product: ChargeStand™ Premium USB-C Cable
- Features: 90° angle design, up to 240W power delivery, braided nylon construction, 1.5m (5ft) length
- Compatible with: MacBooks, iPads, iPhones 15+, Samsung Galaxy, Nintendo Switch, most USB-C devices
- Durability: Over 10,000 bend cycles tested
- Package includes: Cable, protective carrying pouch, warranty card

PRICING (all prices in USD):
- Single ChargeStand™ cable: $24.90 (was $49.90 - 50% OFF)
- Duo Pack (2 cables): $39.90 (best for home + office)
- Family Pack (3 cables): $54.90 (best value for families)

SHIPPING:
- FREE worldwide shipping on all orders
- Processing time: 1-2 business days
- Delivery times:
  - USA: 7-10 business days
  - Canada: 8-12 business days
  - Europe: 10-14 business days
  - Australia: 10-14 business days
  - Rest of World: 12-18 business days
- Customs/duties may apply for international orders (customer responsibility)

ORDER TRACKING:
- When an order ships, customers receive an email with a tracking link
- To track an order: check the "Shipping Confirmation" email received when the order was shipped
- The tracking link is in that email and allows to follow the package with the carrier
- If they can't find the email, check spam folder or contact contact@go4charges.com

RETURNS & REFUNDS:
- 30-day money-back guarantee
- Items must be unused, in original packaging
- Return shipping paid by customer (unless defective)
- Defective items: Free replacement or refund including return shipping
- Contact contact@go4charges.com to initiate returns

WARRANTY:
- 2-year warranty on all cables

CONTACT:
- Email: contact@go4charges.com
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SITE_CONTEXT },
          ...messages,
        ],
        stream: true,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
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
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
