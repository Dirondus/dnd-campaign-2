-- Add support for multiple PDFs per player
ALTER TABLE public.players 
DROP COLUMN pdf_url;

-- Add new column for multiple PDF URLs
ALTER TABLE public.players 
ADD COLUMN pdf_urls jsonb DEFAULT '[]'::jsonb;