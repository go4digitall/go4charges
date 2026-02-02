-- Create table to store Lovable Analytics historical data
CREATE TABLE public.lovable_analytics_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE,
  visitors integer NOT NULL DEFAULT 0,
  pageviews integer NOT NULL DEFAULT 0,
  pageviews_per_visit numeric(4,2) DEFAULT 0,
  session_duration_seconds numeric(8,2) DEFAULT 0,
  bounce_rate integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for traffic sources
CREATE TABLE public.lovable_analytics_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name text NOT NULL,
  visits integer NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for device breakdown
CREATE TABLE public.lovable_analytics_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_type text NOT NULL,
  visits integer NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for country breakdown
CREATE TABLE public.lovable_analytics_countries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code text NOT NULL,
  visits integer NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for top pages
CREATE TABLE public.lovable_analytics_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  views integer NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lovable_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lovable_analytics_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lovable_analytics_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lovable_analytics_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lovable_analytics_pages ENABLE ROW LEVEL SECURITY;

-- Allow read access (admin dashboard)
CREATE POLICY "Allow read access" ON public.lovable_analytics_daily FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.lovable_analytics_sources FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.lovable_analytics_devices FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.lovable_analytics_countries FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.lovable_analytics_pages FOR SELECT USING (true);

-- Allow insert for service role
CREATE POLICY "Allow insert" ON public.lovable_analytics_daily FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.lovable_analytics_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.lovable_analytics_devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.lovable_analytics_countries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON public.lovable_analytics_pages FOR INSERT WITH CHECK (true);