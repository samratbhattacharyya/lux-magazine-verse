-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  (SELECT has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can update media files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' AND
  (SELECT has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can delete media files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  (SELECT has_role(auth.uid(), 'admin'))
);