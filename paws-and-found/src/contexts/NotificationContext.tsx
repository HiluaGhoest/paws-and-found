import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import NotificationDropdown from '../components/misc/NotificationDropdown';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = ({ message, type, duration = 5000 }: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const notification: Notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
  };

  const showSuccess = (message: string, duration = 5000) => {
    showNotification({ message, type: 'success', duration });
  };

  const showError = (message: string, duration = 6000) => {
    showNotification({ message, type: 'error', duration });
  };

  const showInfo = (message: string, duration = 5000) => {
    showNotification({ message, type: 'info', duration });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showInfo }}>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
        <div className="flex flex-col items-center gap-3 pt-4">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              style={{ 
                transform: `translateY(${index * 80}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <NotificationDropdown
                message={notification.message}
                type={notification.type}
                duration={notification.duration}
                onClose={() => removeNotification(notification.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
