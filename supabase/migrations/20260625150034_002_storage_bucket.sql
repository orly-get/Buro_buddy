-- Create storage bucket for letters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'letters',
  'letters',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
CREATE POLICY "Allow authenticated users to upload letters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow authenticated users to read own letters"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'letters' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read of letters" -- For serving uploaded files
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'letters');
