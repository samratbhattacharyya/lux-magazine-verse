-- Create enum for post categories
CREATE TYPE public.post_category AS ENUM (
  'Finance',
  'Marketing',
  'HR',
  'Operations',
  'Business Analytics',
  'Technology',
  'General'
);

-- Add category column to posts table
ALTER TABLE public.posts 
ADD COLUMN category public.post_category NOT NULL DEFAULT 'General';