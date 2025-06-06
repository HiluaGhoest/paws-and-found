import { supabase } from '../auth/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const setupDatabase = async () => {
  try {
    // Create profiles table if it doesn't exist
    const { error: profilesError } = await supabase.rpc('create_profiles_table', {});
    
    if (profilesError) {
      console.log('Profiles table setup:', profilesError.message);
    }

    // Create posts table if it doesn't exist
    const { error: postsError } = await supabase.rpc('create_posts_table', {});
    
    if (postsError) {
      console.log('Posts table setup:', postsError.message);
    }

    console.log('Database setup completed');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

// Function to create or update user profile
export const createUserProfile = async (userId: string, profileData: {
  email: string;
  full_name: string;
  phone: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return { data: null, error };
  }
};

// Function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error };
  }
};

// Function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { data: null, error };
  }
};