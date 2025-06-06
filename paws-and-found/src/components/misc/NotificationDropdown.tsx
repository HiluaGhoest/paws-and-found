import { useState, useEffect } from 'react';

interface NotificationDropdownProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function NotificationDropdown({ 
  message, 
  type, 
  onClose, 
  duration = 5000 
}: NotificationDropdownProps) {
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start entrance animation
    const enterTimer = setTimeout(() => setIsEntering(false), 50);
    
    // Auto-hide after duration
    const exitTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
          border: 'border-emerald-300/30',
          icon: '✓',
          iconBg: 'bg-white/20'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          border: 'border-red-300/30',
          icon: '✕',
          iconBg: 'bg-white/20'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          border: 'border-blue-300/30',
          icon: 'ℹ',
          iconBg: 'bg-white/20'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
          border: 'border-gray-300/30',
          icon: '•',
          iconBg: 'bg-white/20'
        };
    }
  };
  const styles = getStyles();
  return (
    <div className="pointer-events-none">
      <div
        className={`
          mx-4 px-5 py-4 rounded-xl backdrop-blur-lg border text-white
          ${styles.bg} ${styles.border}
          pointer-events-auto
          transform transition-all duration-500 ease-out
          ${isEntering 
            ? '-translate-y-4 opacity-0 scale-95' 
            : isExiting 
              ? '-translate-y-4 opacity-0 scale-95'
              : 'translate-y-0 opacity-100 scale-100'
          }
          max-w-sm w-full
          shadow-xl
        `}
      >
        <div className="flex items-start gap-3">
          <div className={`${styles.iconBg} rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <span className="text-sm font-bold text-white">
              {styles.icon}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-relaxed">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-all duration-200 hover:scale-110 transform flex-shrink-0 ml-2"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-white/20 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-white/50 rounded-full"
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
