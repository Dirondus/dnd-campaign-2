-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active',
  last_session DATE,
  members JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  duration INTEGER, -- in minutes
  status TEXT DEFAULT 'completed',
  summary TEXT,
  xp_gained INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lore_entries table
CREATE TABLE public.lore_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create npcs table
CREATE TABLE public.npcs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  location TEXT,
  relationship TEXT,
  importance TEXT,
  description TEXT,
  background TEXT,
  notes TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monsters table  
CREATE TABLE public.monsters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  size TEXT,
  danger_rating TEXT,
  hit_points TEXT,
  strength_dice TEXT,
  magic_dice TEXT,
  elements TEXT[] DEFAULT '{}',
  abilities JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing waypoints table to include category
ALTER TABLE public.waypoints ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'location';

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monsters ENABLE ROW LEVEL SECURITY;

-- Create policies for groups
CREATE POLICY "Users can view all groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Users can manage their own groups" ON public.groups FOR ALL USING (auth.uid() = created_by);

-- Create policies for sessions
CREATE POLICY "Users can view all sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own sessions" ON public.sessions FOR ALL USING (auth.uid() = created_by);

-- Create policies for lore_entries
CREATE POLICY "Users can view all lore entries" ON public.lore_entries FOR SELECT USING (true);
CREATE POLICY "Users can manage their own lore entries" ON public.lore_entries FOR ALL USING (auth.uid() = created_by);

-- Create policies for npcs
CREATE POLICY "Users can view all npcs" ON public.npcs FOR SELECT USING (true);
CREATE POLICY "Users can manage their own npcs" ON public.npcs FOR ALL USING (auth.uid() = created_by);

-- Create policies for monsters
CREATE POLICY "Users can view all monsters" ON public.monsters FOR SELECT USING (true);
CREATE POLICY "Users can manage their own monsters" ON public.monsters FOR ALL USING (auth.uid() = created_by);

-- Create triggers for updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lore_entries_updated_at
  BEFORE UPDATE ON public.lore_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_npcs_updated_at
  BEFORE UPDATE ON public.npcs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monsters_updated_at
  BEFORE UPDATE ON public.monsters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();