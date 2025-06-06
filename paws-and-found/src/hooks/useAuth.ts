import { useState, useEffect } from 'react';
import { supabase } from '../lib/auth/supabaseClient';
import { SessionManager } from '../lib/auth/sessionManager';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session management
    SessionManager.initializeSessionManagement();

    // Get initial user session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await SessionManager.clearSession();
  };

  return {
    user,
    loading,
    handleLogout
  };
};
