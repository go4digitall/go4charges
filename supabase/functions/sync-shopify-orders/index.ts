import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const shopifyAccessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Shopify store domain
    const shopDomain = 'go4charges.myshopify.com';
    const apiVersion = '2025-01';
    
    console.log('Fetching orders from Shopify...');
    
    // Fetch orders from Shopify Admin API
    const shopifyResponse = await fetch(
      `https://${shopDomain}/admin/api/${apiVersion}/orders.json?status=any&limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': shopifyAccessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error('Shopify API error:', shopifyResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Shopify API error: ${shopifyResponse.status}`,
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const shopifyData = await shopifyResponse.json();
    const orders = shopifyData.orders || [];
    
    console.log(`Found ${orders.length} orders in Shopify`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const order of orders) {
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

      const orderData = {
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
      };

      const { error } = await supabase
        .from('shopify_orders')
        .upsert(orderData, {
          onConflict: 'shopify_order_id',
        });

      if (error) {
        console.error(`Error saving order ${order.id}:`, error);
        errors++;
      } else {
        inserted++;
      }
    }

    console.log(`Sync complete: ${inserted} orders synced, ${errors} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      total_orders: orders.length,
      synced: inserted,
      errors: errors 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
