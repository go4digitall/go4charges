-- Table pour stocker les commandes Shopify
CREATE TABLE public.shopify_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shopify_order_id TEXT NOT NULL UNIQUE,
  order_number TEXT,
  email TEXT,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  financial_status TEXT,
  fulfillment_status TEXT,
  items_count INTEGER,
  line_items JSONB DEFAULT '[]',
  customer_data JSONB DEFAULT '{}',
  shipping_address JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_shopify_orders_created_at ON public.shopify_orders(created_at DESC);
CREATE INDEX idx_shopify_orders_financial_status ON public.shopify_orders(financial_status);

-- Enable RLS
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;

-- Policy pour insertion depuis l'edge function (service role)
CREATE POLICY "Allow service role insert"
ON public.shopify_orders
FOR INSERT
WITH CHECK (true);

-- Policy pour lecture (dashboard admin)
CREATE POLICY "Allow all read"
ON public.shopify_orders
FOR SELECT
USING (true);