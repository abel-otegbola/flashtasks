import React from 'react';
import LogoIcon from '../../assets/icons/logo';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-dark-bg overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10 animate-pulse" />

      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center gap-6">
        {/* Logo with pulse animation */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />

            {/* Logo */}
            <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white dark:bg-dark-bg rounded-full shadow-lg">
              <LogoIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Loading
          </h2>
          <div className="flex gap-1 items-center justify-center">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
