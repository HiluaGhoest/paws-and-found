import { useState } from 'react';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

interface FeedHeaderProps {
  user: any;
  onLogout: () => Promise<void>;
}

export default function FeedHeader({ user, onLogout }: FeedHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);  return (
    <header className="bg-transparent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-black text-white drop-shadow-lg">
              Paws & Found
            </h1>
            <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm text-white/80 font-medium">{user.email}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 text-white rounded-lg mx-2">
                  <FiUser className="w-4 h-4" />
                  <span className="font-medium">Profile</span>
                </button>
                <hr className="my-2 border-white/20" />
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-500/20 transition-all duration-300 flex items-center space-x-2 text-red-400 rounded-lg mx-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            {showMobileMenu ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/20 py-4 space-y-2 bg-white/5 backdrop-blur-sm rounded-b-xl">
            {/* Mobile menu items can be added here if needed */}
          </div>
        )}
      </div>
    </header>
  );
}