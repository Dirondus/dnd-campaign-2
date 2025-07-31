-- Fix RLS policies to require authentication for new tables
DROP POLICY IF EXISTS "Users can view all groups" ON public.groups;
DROP POLICY IF EXISTS "Users can manage their own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can view all lore entries" ON public.lore_entries;
DROP POLICY IF EXISTS "Users can manage their own lore entries" ON public.lore_entries;
DROP POLICY IF EXISTS "Users can view all npcs" ON public.npcs;
DROP POLICY IF EXISTS "Users can manage their own npcs" ON public.npcs;
DROP POLICY IF EXISTS "Users can view all monsters" ON public.monsters;
DROP POLICY IF EXISTS "Users can manage their own monsters" ON public.monsters;

-- Create proper authenticated-only policies
-- Groups policies
CREATE POLICY "Authenticated users can view all groups" ON public.groups 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own groups" ON public.groups 
  FOR ALL 
  USING (auth.uid() = created_by);

-- Sessions policies  
CREATE POLICY "Authenticated users can view all sessions" ON public.sessions 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own sessions" ON public.sessions 
  FOR ALL 
  USING (auth.uid() = created_by);

-- Lore entries policies
CREATE POLICY "Authenticated users can view all lore entries" ON public.lore_entries 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own lore entries" ON public.lore_entries 
  FOR ALL 
  USING (auth.uid() = created_by);

-- NPCs policies
CREATE POLICY "Authenticated users can view all npcs" ON public.npcs 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own npcs" ON public.npcs 
  FOR ALL 
  USING (auth.uid() = created_by);

-- Monsters policies
CREATE POLICY "Authenticated users can view all monsters" ON public.monsters 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own monsters" ON public.monsters 
  FOR ALL 
  USING (auth.uid() = created_by);