-- Add likes column to posts table
-- Run this in Supabase SQL Editor

-- Add likes column to posts table with default value 0
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Add constraint to ensure likes cannot be negative
ALTER TABLE posts 
ADD CONSTRAINT check_likes_non_negative 
CHECK (likes >= 0);

-- Create an index on likes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes);

-- Optional: Update existing posts to have 0 likes if any exist without this column
UPDATE posts SET likes = 0 WHERE likes IS NULL;
