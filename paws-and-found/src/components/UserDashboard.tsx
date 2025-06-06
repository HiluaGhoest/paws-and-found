import { useNotification } from '../contexts/NotificationContext';

interface UserDashboardProps {
  user: any;
  onLogout: () => Promise<void>;
  onRefreshImage: () => void;
}

export default function UserDashboard({ user, onLogout, onRefreshImage }: UserDashboardProps) {
  const { showSuccess, showInfo } = useNotification();

  const handleLogout = async () => {
    await onLogout();
    showInfo("You have been logged out successfully.");
  };

  const handleRefreshImage = () => {
    onRefreshImage();
    showSuccess("Background image refreshed!");
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4 text-white">Welcome, {user.email}!</h2>
      <div className="space-y-2">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 block mx-auto"
        >
          Logout
        </button>
        <button
          onClick={handleRefreshImage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Refresh Image
        </button>
      </div>
    </div>
  );
}
