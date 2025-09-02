-- Drop existing problematic storage policies
DROP POLICY IF EXISTS "Users can update their own player PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own player PDFs" ON storage.objects;

-- Create simpler storage policies that don't cause recursion
CREATE POLICY "Authenticated users can update player PDFs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'player-pdfs');

CREATE POLICY "Authenticated users can delete player PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'player-pdfs');