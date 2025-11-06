-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policy for book covers - allow authenticated users to upload
CREATE POLICY "Authenticated users can upload book covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'book-covers' AND
    auth.role() = 'authenticated'
  );

-- Create storage policy for book covers - allow public read access
CREATE POLICY "Public can view book covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');

-- Create storage policy for book covers - allow users to update their own uploads
CREATE POLICY "Users can update their own book covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'book-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );