-- Add storage policy to allow authenticated users to upload maps

CREATE POLICY "Authenticated users can upload maps"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'maps');