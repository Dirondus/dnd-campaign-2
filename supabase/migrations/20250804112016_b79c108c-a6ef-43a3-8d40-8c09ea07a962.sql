-- Update RLS policies to support admin permissions

-- Drop existing policies for groups
DROP POLICY IF EXISTS "Users can manage their own groups" ON public.groups;

-- Create new policies for groups
CREATE POLICY "Admins can manage all groups" ON public.groups
FOR ALL USING (
  auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid OR 
  auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid
);

CREATE POLICY "Users can manage their own groups" ON public.groups
FOR ALL USING (auth.uid() = created_by);

-- Drop existing policies for lore_entries
DROP POLICY IF EXISTS "Users can manage their own lore entries" ON public.lore_entries;

-- Create new policies for lore_entries
CREATE POLICY "Admins can manage all lore entries" ON public.lore_entries
FOR ALL USING (
  auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid OR 
  auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid
);

CREATE POLICY "Users can manage their own lore entries" ON public.lore_entries
FOR ALL USING (auth.uid() = created_by);

-- Drop existing policies for monsters
DROP POLICY IF EXISTS "Users can manage their own monsters" ON public.monsters;

-- Create new policies for monsters
CREATE POLICY "Admins can manage all monsters" ON public.monsters
FOR ALL USING (
  auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid OR 
  auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid
);

CREATE POLICY "Users can manage their own monsters" ON public.monsters
FOR ALL USING (auth.uid() = created_by);

-- Drop existing policies for npcs
DROP POLICY IF EXISTS "Users can manage their own npcs" ON public.npcs;

-- Create new policies for npcs
CREATE POLICY "Admins can manage all npcs" ON public.npcs
FOR ALL USING (
  auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid OR 
  auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid
);

CREATE POLICY "Users can manage their own npcs" ON public.npcs
FOR ALL USING (auth.uid() = created_by);

-- Drop existing policies for sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.sessions;

-- Create new policies for sessions
CREATE POLICY "Admins can manage all sessions" ON public.sessions
FOR ALL USING (
  auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid OR 
  auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid
);

CREATE POLICY "Users can manage their own sessions" ON public.sessions
FOR ALL USING (auth.uid() = created_by);