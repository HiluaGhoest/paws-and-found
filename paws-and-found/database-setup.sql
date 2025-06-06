-- SQL setup for Supabase database
-- This file contains the database setup functions and triggers

-- Create profiles table
CREATE OR REPLACE FUNCTION create_profiles_table() 
RETURNS void AS $$
BEGIN  -- Create profiles table if it doesn't exist
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
  );

  -- Create RLS (Row Level Security) policies
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- Policy: Users can view their own profile
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

  -- Policy: Users can insert their own profile
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

  -- Policy: Users can update their own profile
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);  -- Create function to automatically create profile on user sign up
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'phone', '')
    );
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create trigger to automatically create profile
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

END;
$$ LANGUAGE plpgsql;

-- Create posts table (for future use)
CREATE OR REPLACE FUNCTION create_posts_table() 
RETURNS void AS $$
BEGIN
  -- Create posts table if it doesn't exist
  CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    pet_type TEXT NOT NULL,
    pet_name TEXT,
    status TEXT NOT NULL DEFAULT 'missing', -- 'missing', 'found', 'reunited'
    location TEXT NOT NULL,
    contact_info TEXT,
    images TEXT[], -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create RLS policies for posts
  ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

  -- Policy: Anyone can view posts
  DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
  CREATE POLICY "Anyone can view posts" ON posts
    FOR SELECT USING (true);

  -- Policy: Users can insert their own posts
  DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
  CREATE POLICY "Users can insert own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- Policy: Users can update their own posts
  DROP POLICY IF EXISTS "Users can update own posts" ON posts;
  CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

  -- Policy: Users can delete their own posts
  DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
  CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
