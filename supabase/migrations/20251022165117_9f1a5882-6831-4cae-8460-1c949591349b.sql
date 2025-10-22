-- Drop all existing waypoint policies
DROP POLICY IF EXISTS "Admins can manage all waypoints" ON public.waypoints;
DROP POLICY IF EXISTS "Authenticated users can create waypoints" ON public.waypoints;
DROP POLICY IF EXISTS "Everyone can view waypoints" ON public.waypoints;
DROP POLICY IF EXISTS "Users can update their own waypoints" ON public.waypoints;
DROP POLICY IF EXISTS "Users can delete their own waypoints" ON public.waypoints;

-- Create simple, working policies matching other tables
CREATE POLICY "Authenticated users can view all waypoints" 
ON public.waypoints 
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own waypoints" 
ON public.waypoints 
FOR ALL
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all waypoints" 
ON public.waypoints 
FOR ALL
USING (
  auth.uid() = '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a'::uuid OR 
  auth.uid() = 'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'::uuid
);