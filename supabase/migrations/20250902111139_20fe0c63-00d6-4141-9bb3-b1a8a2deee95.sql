
-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policies for players table
CREATE POLICY "Authenticated users can view all players"
  ON public.players
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own players"
  ON public.players
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all players"
  ON public.players
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid OR 
    auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid
  );

-- Create storage bucket for player PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('player-pdfs', 'player-pdfs', true);

-- Create storage policies
CREATE POLICY "Authenticated users can upload player PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'player-pdfs');

CREATE POLICY "Anyone can view player PDFs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'player-pdfs');

CREATE POLICY "Users can update their own player PDFs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'player-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own player PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'player-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add trigger for updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
