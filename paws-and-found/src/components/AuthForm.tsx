import { useState, useEffect } from "react";
import { supabase } from "../lib/auth/supabaseClient";
import { SessionManager } from "../lib/auth/sessionManager";
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useNotification } from '../contexts/NotificationContext';

export default function AuthForm() {
  const { showSuccess, showError } = useNotification();const [email, setEmail] = useState("");	
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{email?: string, password?: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  // Auto-focus email field on mount and load remember me preference
  useEffect(() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) emailInput.focus();
    
    // Load remember me preference
    const shouldRemember = SessionManager.shouldRememberUser();
    setRememberMe(shouldRemember);
  }, []);
  const validateForm = () => {
    const errors: {email?: string, password?: string} = {};
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (!isLogin && password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    
    // Show first validation error as notification
    if (errors.email) {
      showError(errors.email);
    } else if (errors.password) {
      showError(errors.password);
    }
    
    return Object.keys(errors).length === 0;
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    let result;
    if (isLogin) {
      // Sign in with password
      result = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      // Handle "Remember Me" functionality with SessionManager
      if (!result.error && result.data.session) {
        await SessionManager.handleSessionPersistence(rememberMe);
      }
    } else {
      // Sign up
      result = await supabase.auth.signUp({ email, password });
    }
    
    const { error } = result;
    
    if (error) {
      showError(error.message);
    } else {
      if (isLogin) {
        showSuccess("Login successful!");
      } else {
        showSuccess("Account created successfully! Please check your email to verify your account.");
      }
      // Clear form on success
      setEmail("");
      setPassword("");
    }
    
    setLoading(false);
  };return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
      <h1 className="text-2xl font-bold mb-5 text-white text-center">
        {isLogin ? "Welcome Back" : "Join Us"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input 
            type="email"
            className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${validationErrors.email ? 'border-red-400/50 ring-2 ring-red-400/50' : 'border-white/30 hover:border-white/50'}`}
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) setValidationErrors(prev => ({...prev, email: undefined}));
            }}
            required
          />
          {validationErrors.email && <p className="text-red-400 text-sm mt-2">{validationErrors.email}</p>}
        </div>
        
        <div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${validationErrors.password ? 'border-red-400/50 ring-2 ring-red-400/50' : 'border-white/30 hover:border-white/50'}`}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors(prev => ({...prev, password: undefined}));
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-300"
            >
              {showPassword ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}
            </button>
          </div>
          {validationErrors.password && <p className="text-red-400 text-sm mt-2">{validationErrors.password}</p>}
        </div>
        
        {isLogin && (
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-3 w-4 h-4 text-blue-600 bg-transparent border-white/30 rounded focus:ring-blue-500 focus:ring-2"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {/* TODO: Implement forgot password */}}
              className="text-blue-300 hover:text-blue-200 transition-colors duration-300"
            >
              Forgot password?
            </button>
          </div>
        )}        
        {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-400/20">{error}</p>}
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm text-white py-4 rounded-xl hover:from-blue-600/80 hover:to-purple-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          disabled={loading}
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
        
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-sm text-white/80 mt-6 hover:text-white transition-colors duration-300"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}