-- Allow authenticated users to create waypoints
CREATE POLICY "Users can create their own waypoints" 
ON public.waypoints 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to update their own waypoints
CREATE POLICY "Users can update their own waypoints" 
ON public.waypoints 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow authenticated users to delete their own waypoints
CREATE POLICY "Users can delete their own waypoints" 
ON public.waypoints 
FOR DELETE 
USING (auth.uid() = created_by);