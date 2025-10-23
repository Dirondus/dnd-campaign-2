-- Update RLS policies for maps table to allow authenticated users to create maps

-- Drop existing admin management policy
DROP POLICY IF EXISTS "Admins can manage maps" ON public.maps;

-- Create separate policies for different operations
CREATE POLICY "Authenticated users can create maps" 
ON public.maps 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own maps" 
ON public.maps 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own maps" 
ON public.maps 
FOR DELETE 
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all maps" 
ON public.maps 
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'::user_role
  )
);