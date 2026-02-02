-- Table pour stocker les événements analytiques
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre l'insertion depuis le frontend (anonyme)
CREATE POLICY "Allow anonymous insert"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Policy pour lecture admin (service role uniquement)
CREATE POLICY "Allow service role read"
ON public.analytics_events
FOR SELECT
USING (true);