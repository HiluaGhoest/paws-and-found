import AuthForm from "../../lib/auth/AuthForm";
import UserDashboard from "../UserDashboard";

interface AuthSectionProps {
  user: any;
  onLogout: () => Promise<void>;
  onRefreshImage: () => void;
}

export default function AuthSection({ user, onLogout, onRefreshImage }: AuthSectionProps) {
  return (
    <div className="w-1/2 flex flex-col bg-gray-900 relative">      {/* Header with website name and CTA - Modern text styling */}
      <div className="absolute top-6 left-6 text-white z-10 space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
            Paws & Found
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-semibold text-blue-300">
            Find. Adopt. Love.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm font-normal">
            Connect loving pets with caring families through our adoption platform
          </p>
        </div>
      </div>      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center pt-42 pb-8">
        <div className="w-full max-w-lg">          {user ? (
            <UserDashboard
              user={user} 
              onLogout={onLogout} 
              onRefreshImage={onRefreshImage} 
            />          ) : (
            <AuthForm />
          )}
        </div>
      </div>
    </div>
  );
}
