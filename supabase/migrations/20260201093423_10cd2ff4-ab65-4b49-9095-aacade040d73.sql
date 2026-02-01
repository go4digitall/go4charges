-- Create chat_messages table to store all chatbot interactions
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient session lookups
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable RLS but allow all operations (anonymous public access for analytics)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow inserts from edge functions (service role)
CREATE POLICY "Allow service role full access" 
ON public.chat_messages 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.chat_messages IS 'Stores chatbot conversation history for analytics purposes';