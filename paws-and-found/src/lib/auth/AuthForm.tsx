import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { SessionManager } from "./sessionManager";
import { MdVisibility, MdVisibilityOff, MdLocationOn } from 'react-icons/md';
import { useNotification } from '../../contexts/NotificationContext';
import { createUserProfile } from '../storage/setupDatabase';
import { detectLocationQuick, improveLocationInBackground, saveUserLocation, getLocationForDisplay, detectAndSaveLocation } from '../storage/locationStorage';

export default function AuthForm() {
  const { showSuccess, showError } = useNotification();
  
  // Existing fields
  const [email, setEmail] = useState("");	
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [validationErrors, setValidationErrors] = useState<{
    email?: string, 
    password?: string,
    fullName?: string,
    location?: string,
    phone?: string
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // New sign-up fields
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [telephone, setTelephone] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  // Phone formatting utilities
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const formatToInternational = (phoneNumber: string) => {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it's a 10-digit US number, add +1 prefix
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already has country code, return as is with + prefix
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // For other cases, assume it's US and add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // Return the original if we can't determine format
    return phoneNumber;
  };// Auto-location detection
  const getLocation = async () => {
    setLocationLoading(true);
    
    const success = await detectAndSaveLocation();
    if (success) {
      const savedLocation = getLocationForDisplay();
      setLocation(savedLocation);
    }
    
    setLocationLoading(false);
  };// Auto-focus email field on mount and load remember me preference
  useEffect(() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) emailInput.focus();
    
    // Load remember me preference
    const shouldRemember = SessionManager.shouldRememberUser();
    setRememberMe(shouldRemember);

    // Load saved location from local storage
    const savedLocation = getLocationForDisplay();
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  // Auto-fetch location when switching to sign-up mode
  useEffect(() => {
    if (!isLogin && !location && !locationLoading) {
      getLocation();
    }
  }, [isLogin]);const validateForm = () => {
    const errors: {
      email?: string, 
      password?: string,
      fullName?: string,
      location?: string,
      phone?: string
    } = {};
    
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

    // Additional validation for sign-up
    if (!isLogin) {
      if (!fullName.trim()) {
        errors.fullName = "Full name or alias is required";
      }
      
      if (!location.trim()) {
        errors.location = "Location is required";
      }
      
      if (!telephone.trim()) {
        errors.phone = "Phone number is required";
      } else if (telephone.replace(/\D/g, '').length < 10) {
        errors.phone = "Please enter a valid 10-digit phone number";
      }
    }
    
    setValidationErrors(errors);
    
    // Show first validation error as notification
    if (errors.email) {
      showError(errors.email);
    } else if (errors.password) {
      showError(errors.password);
    } else if (errors.fullName) {
      showError(errors.fullName);
    } else if (errors.location) {
      showError(errors.location);
    } else if (errors.phone) {
      showError(errors.phone);
    }
    
    return Object.keys(errors).length === 0;
  };const handleSubmit = async (e: React.FormEvent) => {
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
      }    } else {
      // Sign up with additional profile data
      result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            phone: formatToInternational(telephone)
          }
        }
      });

      // If sign-up successful, create profile in database and save location locally
      if (!result.error && result.data.user) {
        // Save profile to database (without location)
        const profileResult = await createUserProfile(result.data.user.id, {
          email,
          full_name: fullName,
          phone: formatToInternational(telephone)
        });

        if (profileResult.error) {
          console.error('Error creating user profile:', profileResult.error);
          // Don't fail the sign-up process, just log the error
        }

        // Save location locally
        if (location.trim()) {
          saveUserLocation(location);
        }
      }
    }
    
    const { error } = result;
      if (error) {
      showError(error.message);
    } else {
      if (isLogin) {
        showSuccess("Login successful!");
      } else {
        showSuccess("Account created successfully! Please check your email to verify your account before signing in.");
      }// Clear form on success
      setEmail("");
      setPassword("");
      if (!isLogin) {
        setFullName("");
        setLocation("");
        setTelephone("");
      }
    }
    
    setLoading(false);
  };return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">      <h1 className="text-2xl font-bold mb-5 text-white text-center drop-shadow-lg">
        {isLogin ? "Welcome Back" : "Create Your Account"}
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
            </button>          </div>
          {validationErrors.password && <p className="text-red-400 text-sm mt-2">{validationErrors.password}</p>}
        </div>
        
        {/* Additional fields for sign-up */}
        {!isLogin && (
          <>
            {/* Full Name / Alias */}
            <div>
              <input 
                type="text"
                className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${validationErrors.fullName ? 'border-red-400/50 ring-2 ring-red-400/50' : 'border-white/30 hover:border-white/50'}`}
                placeholder="Full Name or Alias"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (validationErrors.fullName) setValidationErrors(prev => ({...prev, fullName: undefined}));
                }}
                required
              />
              {validationErrors.fullName && <p className="text-red-400 text-sm mt-2">{validationErrors.fullName}</p>}
            </div>            {/* Phone and Location in same row */}
            <div className="flex gap-3">              {/* Telephone */}
              <div className="flex-1">
                <input 
                  type="tel"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${validationErrors.phone ? 'border-red-400/50 ring-2 ring-red-400/50' : 'border-white/30 hover:border-white/50'}`}
                  placeholder="Phone Number"
                  value={telephone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setTelephone(formatted);
                    if (validationErrors.phone) setValidationErrors(prev => ({...prev, phone: undefined}));
                  }}
                  maxLength={14} // (XXX) XXX-XXXX format
                  required
                />
                {validationErrors.phone && <p className="text-red-400 text-sm mt-2">{validationErrors.phone}</p>}
                {!validationErrors.phone && telephone.length > 0 && (
                  <p className="text-white/60 text-xs mt-2">Format: (XXX) XXX-XXXX</p>
                )}
              </div>{/* Location */}
              <div className="flex-1">
                <div className="relative">                  <input 
                    type="text"
                    className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 ${validationErrors.location ? 'border-red-400/50 ring-2 ring-red-400/50' : 'border-white/30 hover:border-white/50'}`}
                    placeholder={locationLoading ? "Detecting location..." : "Location (City, State)"}
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      // Save to local storage as user types
                      if (e.target.value.trim()) {
                        saveUserLocation(e.target.value);
                      }
                      if (validationErrors.location) setValidationErrors(prev => ({...prev, location: undefined}));
                    }}
                    required
                  />
                  {locationLoading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <MdLocationOn size={20} className="text-white/70 animate-pulse" />
                    </div>
                  )}
                </div>
                {validationErrors.location && <p className="text-red-400 text-sm mt-2">{validationErrors.location}</p>}
                {locationLoading && (
                  <p className="text-white/60 text-xs mt-2">Auto-detecting your location...</p>
                )}
              </div>
            </div>
          </>        )}
        
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
          onClick={() => {
            setIsLogin(!isLogin);
            // Clear additional fields when switching modes
            setFullName("");
            setLocation("");
            setTelephone("");
            setValidationErrors({});
          }}
          className="w-full text-sm text-white/80 mt-6 hover:text-white transition-colors duration-300"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}