-- Drop the foreign key constraint that's causing the issue
ALTER TABLE public.waypoints 
DROP CONSTRAINT IF EXISTS waypoints_created_by_fkey;

-- The RLS policies already handle security, so we don't need this foreign key