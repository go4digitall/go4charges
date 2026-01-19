import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'gu1ybs-es.myshopify.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, email } = await req.json();

    if (!orderNumber || !email) {
      return new Response(
        JSON.stringify({ error: 'Order number and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('SHOPIFY_ACCESS_TOKEN is not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the order number (remove # if present)
    const cleanOrderNumber = orderNumber.replace('#', '').trim();
    
    console.log(`Looking up order: ${cleanOrderNumber} for email: ${email}`);

    // Query Shopify Admin API for the order
    const searchQuery = `name:#${cleanOrderNumber}`;
    const shopifyUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/orders.json?name=${encodeURIComponent('#' + cleanOrderNumber)}&status=any`;
    
    console.log(`Fetching from Shopify: ${shopifyUrl}`);

    const shopifyResponse = await fetch(shopifyUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error(`Shopify API error: ${shopifyResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Unable to retrieve order information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shopifyData = await shopifyResponse.json();
    console.log(`Found ${shopifyData.orders?.length || 0} orders`);

    if (!shopifyData.orders || shopifyData.orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order not found. Please check your order number.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the order matching the email
    const order = shopifyData.orders.find(
      (o: any) => o.email?.toLowerCase() === email.toLowerCase()
    );

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Order not found. Please verify your email address matches the one used for the order.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Order found: ${order.name}, status: ${order.fulfillment_status}`);

    // Extract fulfillment/tracking info
    let trackingNumber = null;
    let trackingUrl = null;
    let carrierName = null;

    if (order.fulfillments && order.fulfillments.length > 0) {
      const latestFulfillment = order.fulfillments[order.fulfillments.length - 1];
      if (latestFulfillment.tracking_numbers && latestFulfillment.tracking_numbers.length > 0) {
        trackingNumber = latestFulfillment.tracking_numbers[0];
      }
      if (latestFulfillment.tracking_urls && latestFulfillment.tracking_urls.length > 0) {
        trackingUrl = latestFulfillment.tracking_urls[0];
      }
      if (latestFulfillment.tracking_company) {
        carrierName = latestFulfillment.tracking_company;
      }
    }

    // Build response
    const response = {
      orderNumber: order.name.replace('#', ''),
      email: order.email,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      createdAt: order.created_at,
      trackingNumber,
      trackingUrl,
      carrierName,
      lineItems: order.line_items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
      })),
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
