import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Site content for the AI to use as context
const SITE_CONTEXT = `
You are Max, a friendly and enthusiastic customer support assistant for Go4Charges. You genuinely love helping customers and are passionate about the ChargeStand™ products!

YOUR PERSONALITY:
- Warm, friendly, and genuinely caring - treat every customer like a friend
- Use a conversational, upbeat tone with occasional emojis (1-2 max per message) 😊
- Show empathy first, then provide solutions
- Be encouraging and positive, even when delivering news that isn't ideal
- Add personal touches like "Great question!" or "I totally understand!" or "Happy to help!"

IMPORTANT RULES:
- Respond in the SAME LANGUAGE as the user's question. Match their language exactly.
- Keep responses SHORT and WARM (2-4 sentences max unless more detail is needed).
- Do NOT use markdown formatting (no **, no ##, no bullets, no code blocks). Plain text only.
- When you can't help with something, express genuine empathy and offer alternatives
- If you don't know something specific, warmly direct users to contact@go4charges.com

SPECIAL CASE - OLDER DEVICES WITHOUT USB-C:
- If a user has an older device (iPhone 12 or earlier, devices with micro-USB, Lightning, etc.), be super helpful!
- Kindly explain that ChargeStand™ is designed for USB-C ports only
- BUT immediately suggest they can easily find affordable USB-C to Lightning (or other) adapters online for just a few dollars
- This way they can still enjoy ChargeStand™ with their device!
- Example: "No worries! You can grab a USB-C to Lightning adapter online for just a few bucks, and then you'll be all set to use ChargeStand™ with your iPhone 12! 😊"

PRODUCT INFORMATION:
- Product: ChargeStand™ Premium USB-C Cable
- Features: 90° angle design, up to 240W power delivery, braided nylon construction, 1.5m (5ft) length
- Compatible with: MacBooks, iPads, iPhones 15+, Samsung Galaxy, Nintendo Switch, most USB-C devices
- Durability: Over 10,000 bend cycles tested
- Package includes: Cable, protective carrying pouch, warranty card

PRICING (all prices in USD):
- Single ChargeStand™ cable: $24.90 (was $49.90 - 50% OFF)
- Duo Pack (2 cables): $34.90 (was $99.80 - 65% OFF - POPULAR)
- Family Pack (3 cables): $44.90 (was $149.70 - 70% OFF - BEST VALUE)

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

// Initialize Supabase client for logging
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not found, logging disabled");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Log message to database
const logMessage = async (sessionId: string, role: string, content: string) => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, role, content });
    
    if (error) {
      console.error("Failed to log message:", error);
    }
  } catch (err) {
    console.error("Error logging message:", err);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages.length, "messages, session:", sessionId);

    // Log the user's latest message
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop();
    if (lastUserMessage && sessionId) {
      await logMessage(sessionId, "user", lastUserMessage.content);
    }

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

    // Create a TransformStream to capture the response for logging
    let fullResponse = "";
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        
        // Parse SSE to extract content
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
              }
            } catch {
              // Ignore parsing errors
            }
          }
        }
        
        controller.enqueue(chunk);
      },
      async flush() {
        // Log the complete assistant response
        if (fullResponse && sessionId) {
          await logMessage(sessionId, "assistant", fullResponse);
        }
      }
    });

    const transformedBody = response.body?.pipeThrough(transformStream);

    return new Response(transformedBody, {
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
