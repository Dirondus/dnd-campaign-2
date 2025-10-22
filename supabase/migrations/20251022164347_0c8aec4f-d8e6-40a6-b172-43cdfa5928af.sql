-- Drop the existing admin policy that might have RLS recursion issues
DROP POLICY IF EXISTS "Admins can manage waypoints" ON public.waypoints;

-- Create a new admin policy using the security definer function
CREATE POLICY "Admins can manage all waypoints" 
ON public.waypoints 
FOR ALL
USING (get_current_user_role() = 'admin');

-- Also allow all authenticated users to insert waypoints as fallback
DROP POLICY IF EXISTS "Users can create their own waypoints" ON public.waypoints;

CREATE POLICY "Authenticated users can create waypoints" 
ON public.waypoints 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);