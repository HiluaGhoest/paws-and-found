# Database Setup Instructions for Paws & Found

This document explains how to set up the database for the Paws & Found application.

## Prerequisites
- Supabase project set up
- Environment variables configured (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)

## Setup Steps

### 1. Run SQL Setup in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `database-setup.sql` into the SQL editor
4. Run the SQL commands

This will create:
- `profiles` table with user profile information
- `posts` table for pet posts (future use)
- Row Level Security (RLS) policies
- Automatic trigger to create profiles when users sign up

### 2. Profile Fields

**Database Storage (Immutable/Core Profile Data):**
- `full_name` - User's full name or alias
- `telephone` - User's phone number (formatted as (XXX) XXX-XXXX)
- `email` - User's email address
- `avatar_url` - Profile picture URL (optional, for future use)

**Local Storage (Mutable/Personal Preferences):**
- `location` - User's current location (auto-detected or manually entered)
  - Stored locally for easy updates when user moves or changes search area
  - Automatically saved as user types in the location field
  - Persists across sessions but can be easily changed

### 3. Data Flow

1. **Sign-up Process:**
   - User fills out AuthForm with email, password, full name, location, phone
   - Supabase auth creates user account with metadata (name, phone)
   - Database trigger automatically creates profile record (name, phone, email)
   - Location is saved to local storage for easy updates
   - Additional API call ensures profile is properly stored

2. **Location Management:**
   - Location auto-detection saves to local storage
   - User can manually update location (saves automatically)
   - Location persists across sessions but remains easily changeable
   - No database queries needed for location updates

3. **Authentication:**
   - Core profile data stored in database (name, phone, email)
   - Location preference stored locally on user's device
   - Profile data can be queried using helper functions in `setupDatabase.ts`

### 4. Available Functions

**Database Functions (`setupDatabase.ts`):**
- `createUserProfile()` - Create/update user profile (name, phone, email)
- `getUserProfile()` - Fetch user profile data
- `updateUserProfile()` - Update existing profile
- `setupDatabase()` - Initialize database structure

**Location Functions (`locationStorage.ts`):**
- `detectAndSaveLocation()` - Auto-detect and save location locally
- `saveUserLocation()` - Save location to local storage
- `getUserLocation()` - Get location data from local storage
- `getLocationForDisplay()` - Get location string for UI display
- `updateUserLocation()` - Update location manually
- `clearUserLocation()` - Clear saved location

### 5. Security

- Row Level Security (RLS) is enabled
- Users can only access their own profile data
- Posts table is set up for future use with appropriate permissions

## Testing

After setup, test the flow:
1. Create a new account with the enhanced sign-up form
2. Check Supabase dashboard to verify profile was created (name, phone, email)
3. Verify location is saved locally (check browser localStorage)
4. Test location updates by changing the location field
5. Verify location persists after page refresh

## Troubleshooting

If profiles aren't being created:
1. Check Supabase logs for errors
2. Verify the trigger function is created
3. Ensure RLS policies are correctly applied
4. Check network requests in browser dev tools
