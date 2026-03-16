-- Migration: Add image_url column to editions table
ALTER TABLE public.editions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket (run this in Supabase Dashboard SQL Editor)
-- Note: You need to create the 'images' bucket in Supabase Storage UI first

-- Storage policies for images bucket
-- These policies allow public read access and authenticated user uploads

DO $$ 
BEGIN
  -- Allow anyone to view images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for images' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public read access for images" ON storage.objects
      FOR SELECT USING (bucket_id = 'images');
  END IF;

  -- Allow authenticated users to upload images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload images' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can upload images" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
  END IF;

  -- Allow authenticated users to update images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update images' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can update images" ON storage.objects
      FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
  END IF;

  -- Allow authenticated users to delete images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete images' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can delete images" ON storage.objects
      FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Migration: Add episode_id to reels table (run this portion if tables already exist)

-- Drop the old key_questions column from episodes if it exists
ALTER TABLE public.episodes DROP COLUMN IF EXISTS key_questions;

-- Add episode_id column to reels table (if column doesn't exist)
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL;

-- Enable RLS on reels if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'reels_all_authenticated' AND tablename = 'reels'
  ) THEN
    ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "reels_all_authenticated" ON public.reels
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Create schedules table (one per edition - holds dates)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edition_id UUID NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create schedule_tasks table (multiple per schedule)
CREATE TABLE IF NOT EXISTS public.schedule_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_date DATE,
  task_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all for authenticated users" ON public.schedules
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.schedule_tasks
  FOR ALL USING (auth.role() = 'authenticated');

-- Login table for admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO public.admin_users (email, password, name) 
VALUES ('admin@talentunwrapped.com', 'admin123', 'Admin')
ON CONFLICT (email) DO NOTHING;
