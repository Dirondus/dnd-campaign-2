-- Create regions table
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  history TEXT,
  notable_features TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  description TEXT,
  key_details TEXT,
  background TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for regions
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Enable RLS for locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for regions
CREATE POLICY "Authenticated users can view all regions" 
ON public.regions 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Users can manage their own regions" 
ON public.regions 
FOR ALL 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all regions" 
ON public.regions 
FOR ALL 
USING ((auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid) OR (auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid));

-- RLS policies for locations
CREATE POLICY "Authenticated users can view all locations" 
ON public.locations 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Users can manage their own locations" 
ON public.locations 
FOR ALL 
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all locations" 
ON public.locations 
FOR ALL 
USING ((auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid) OR (auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_regions_updated_at
BEFORE UPDATE ON public.regions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();