import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Shopify webhook headers
    const shopifyTopic = req.headers.get('x-shopify-topic');
    const shopifyShop = req.headers.get('x-shopify-shop-domain');
    
    console.log(`Received webhook: ${shopifyTopic} from ${shopifyShop}`);

    const body = await req.json();
    
    // Handle different webhook topics
    if (shopifyTopic === 'orders/create' || shopifyTopic === 'orders/paid') {
      const order = body;
      
      console.log(`Processing order: ${order.id}, total: ${order.total_price}`);
      
      // Extract line items summary
      const lineItems = order.line_items?.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        variant_title: item.variant_title,
        sku: item.sku,
      })) || [];

      // Extract customer data (anonymized for privacy)
      const customerData = {
        first_name: order.customer?.first_name || null,
        city: order.shipping_address?.city || order.billing_address?.city || null,
        country: order.shipping_address?.country || order.billing_address?.country || null,
      };

      // Upsert order to avoid duplicates
      const { error } = await supabase
        .from('shopify_orders')
        .upsert({
          shopify_order_id: String(order.id),
          order_number: order.name || order.order_number,
          email: order.email,
          total_price: parseFloat(order.total_price) || 0,
          currency: order.currency || 'USD',
          financial_status: order.financial_status,
          fulfillment_status: order.fulfillment_status,
          items_count: order.line_items?.length || 0,
          line_items: lineItems,
          customer_data: customerData,
          shipping_address: {
            city: order.shipping_address?.city,
            country: order.shipping_address?.country,
            province: order.shipping_address?.province,
          },
          processed_at: order.processed_at || order.created_at,
        }, {
          onConflict: 'shopify_order_id',
        });

      if (error) {
        console.error('Error saving order:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Order ${order.id} saved successfully`);
      
      return new Response(JSON.stringify({ success: true, orderId: order.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle orders/cancelled
    if (shopifyTopic === 'orders/cancelled') {
      const { error } = await supabase
        .from('shopify_orders')
        .update({ financial_status: 'cancelled' })
        .eq('shopify_order_id', String(body.id));

      if (error) {
        console.error('Error updating cancelled order:', error);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle orders/fulfilled
    if (shopifyTopic === 'orders/fulfilled') {
      const { error } = await supabase
        .from('shopify_orders')
        .update({ fulfillment_status: 'fulfilled' })
        .eq('shopify_order_id', String(body.id));

      if (error) {
        console.error('Error updating fulfilled order:', error);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default response for unhandled topics
    console.log(`Unhandled webhook topic: ${shopifyTopic}`);
    return new Response(JSON.stringify({ success: true, message: 'Webhook received' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
