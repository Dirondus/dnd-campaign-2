-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'guest');

-- Create profiles table for username-based authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create maps table
CREATE TABLE public.maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;

-- Map policies
CREATE POLICY "Everyone can view active maps" 
ON public.maps 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage maps" 
ON public.maps 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create waypoints table
CREATE TABLE public.waypoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  x_position FLOAT NOT NULL,
  y_position FLOAT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waypoints ENABLE ROW LEVEL SECURITY;

-- Waypoint policies
CREATE POLICY "Everyone can view waypoints" 
ON public.waypoints 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage waypoints" 
ON public.waypoints 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create campaign content tables
CREATE TABLE public.magic_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  rarity TEXT,
  properties JSONB,
  visible_to_user UUID REFERENCES public.profiles(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.magic_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.weapons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  damage TEXT,
  weapon_type TEXT,
  properties JSONB,
  visible_to_user UUID REFERENCES public.profiles(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weapons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  species TEXT,
  stats JSONB,
  visible_to_user UUID REFERENCES public.profiles(id),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Content policies for magic items, weapons, and pets
CREATE POLICY "Users can view public content and their own content" 
ON public.magic_items 
FOR SELECT 
USING (is_public = true OR visible_to_user = auth.uid());

CREATE POLICY "Admins can manage all magic items" 
ON public.magic_items 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can view public content and their own content" 
ON public.weapons 
FOR SELECT 
USING (is_public = true OR visible_to_user = auth.uid());

CREATE POLICY "Admins can manage all weapons" 
ON public.weapons 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can view public content and their own content" 
ON public.pets 
FOR SELECT 
USING (is_public = true OR visible_to_user = auth.uid());

CREATE POLICY "Admins can manage all pets" 
ON public.pets 
FOR ALL 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Insert initial admin users
INSERT INTO public.profiles (username, role, display_name) VALUES 
('Keyeen', 'admin', 'Keyeen'),
('Duane', 'admin', 'Duane'),
('Dirondus', 'user', 'Dirondus'),
('Guest', 'guest', 'Guest');

-- Create storage bucket for map images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('maps', 'maps', true);

-- Storage policies for maps
CREATE POLICY "Anyone can view map images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'maps');

CREATE POLICY "Admins can upload map images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'maps' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update map images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'maps' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete map images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'maps' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maps_updated_at
BEFORE UPDATE ON public.maps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waypoints_updated_at
BEFORE UPDATE ON public.waypoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_magic_items_updated_at
BEFORE UPDATE ON public.magic_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weapons_updated_at
BEFORE UPDATE ON public.weapons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
BEFORE UPDATE ON public.pets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();