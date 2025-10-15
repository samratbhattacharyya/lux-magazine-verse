-- Create gallery table
CREATE TABLE public.gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Gallery policies
CREATE POLICY "Gallery items are viewable by everyone"
  ON public.gallery
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert gallery items"
  ON public.gallery
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery items"
  ON public.gallery
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery items"
  ON public.gallery
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  event_date timestamp with time zone NOT NULL,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON public.events
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert events"
  ON public.events
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update events"
  ON public.events
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete events"
  ON public.events
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add update trigger for gallery
CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add update trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();