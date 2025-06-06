import { useEffect } from 'react';
import './App.css'
import AuthSection from './components/landing_page/AuthSection';
import BackgroundImage from './components/landing_page/BackgroundImage';
import FeedPage from './components/feed_page/FeedPage';
import CustomCursor from './components/misc/CustomCursor';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { useUnsplashImage } from './hooks/useUnsplashImage';
import { setupDatabase } from './lib/storage/setupDatabase';

function App() {
  const { user, loading, handleLogout } = useAuth();
  const { bgUrl, photoCredit, clearImageCache } = useUnsplashImage();

  // Initialize database on app start
  useEffect(() => {
    setupDatabase();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <NotificationProvider>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <CustomCursor size={12} color="#FFFFFF" smoothness={0.75} />
      
      {user ? (
        // Show feed page when user is logged in
        <FeedPage user={user} onLogout={handleLogout} />
      ) : (
        // Show landing page when user is not logged in
        <div className="min-h-screen flex">
          <AuthSection
            user={user}
            onLogout={handleLogout}
            onRefreshImage={clearImageCache}
          />
          <BackgroundImage
            bgUrl={bgUrl}
            photoCredit={photoCredit}
          />
        </div>
      )}
    </NotificationProvider>
  )
}

export default App