import './App.css'
import AuthSection from './components/AuthSection';
import BackgroundImage from './components/BackgroundImage';
import CustomCursor from './components/CustomCursor';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { useUnsplashImage } from './hooks/useUnsplashImage';

function App() {
  const { user, loading, handleLogout } = useAuth();
  const { bgUrl, photoCredit, clearImageCache } = useUnsplashImage();

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
      <div className="min-h-screen flex">
        <CustomCursor size={12} color="#FFFFFF" smoothness={0.75} />
        
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
    </NotificationProvider>
  )
}

export default App
