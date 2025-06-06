// Session management utilities for persistent login
import { supabase } from './supabaseClient';

export class SessionManager {
  private static REMEMBER_KEY = 'paws-remember-me';
  private static SESSION_KEY = 'paws-session-data';

  static shouldRememberUser(): boolean {
    return localStorage.getItem(this.REMEMBER_KEY) === 'true';
  }

  static setRememberPreference(remember: boolean): void {
    localStorage.setItem(this.REMEMBER_KEY, remember.toString());
  }

  static async handleSessionPersistence(remember: boolean): Promise<void> {
    this.setRememberPreference(remember);
    
    if (remember) {
      // User wants to be remembered - session will persist in localStorage automatically
      // Supabase already handles this with persistSession: true
      return;
    } else {
      // User doesn't want to be remembered - we need to manage session cleanup
      // Set up a listener to clear session when browser is closed
      this.setupSessionCleanup();
    }
  }

  static setupSessionCleanup(): void {
    // Clear session when all tabs are closed (not just refresh)
    window.addEventListener('beforeunload', () => {
      if (!this.shouldRememberUser()) {
        // Store session temporarily for this browser session only
        const currentSession = localStorage.getItem('sb-' + window.location.hostname.replace(/\./g, '-') + '-auth-token');
        if (currentSession) {
          sessionStorage.setItem(this.SESSION_KEY, currentSession);
        }
      }
    });

    // Check if we should restore a session-only login
    const sessionData = sessionStorage.getItem(this.SESSION_KEY);
    if (sessionData && !this.shouldRememberUser()) {
      // Restore session for this browser session
      localStorage.setItem('sb-' + window.location.hostname.replace(/\./g, '-') + '-auth-token', sessionData);
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }

  static async clearSession(): Promise<void> {
    localStorage.removeItem(this.REMEMBER_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    await supabase.auth.signOut();
  }

  static initializeSessionManagement(): void {
    // Set up session cleanup on app start
    if (!this.shouldRememberUser()) {
      this.setupSessionCleanup();
    }
  }
}
