// Setup script to create the Supabase Storage bucket
import { supabase } from '../auth/supabaseClient';

export async function createStorageBucket() {
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'post-images');
    
    if (bucketExists) {
      console.log('Bucket "post-images" already exists');
      return true;
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('post-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB limit
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return false;
    }

    console.log('Bucket "post-images" created successfully:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Run this function to setup the bucket
if (import.meta.env.DEV) {
  // Only run in development mode
  createStorageBucket().then(success => {
    if (success) {
      console.log('✅ Storage bucket setup complete');
    } else {
      console.log('❌ Storage bucket setup failed');
    }
  });
}
