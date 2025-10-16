import { useEffect, useState } from 'react';
import { Window } from '@tauri-apps/api/window';

export const SplashScreen = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate loading time (you can replace with actual initialization logic)
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000); // 2 seconds splash

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const closeSplashAndShowMain = async () => {
      try {
        // Get the main window and splash window
        const mainWindow = await Window.getByLabel('main');
        const splashWindow = await Window.getByLabel('splashscreen');

        if (mainWindow && splashWindow) {
          // Show main window first
          await mainWindow.show();
          await mainWindow.setFocus();

          // Small delay before closing splash for smooth transition
          setTimeout(async () => {
            await splashWindow.close();
          }, 300);
        }
      } catch (error) {
        console.error('Error closing splash screen:', error);
      }
    };

    void closeSplashAndShowMain();
  }, [isReady]);

  return (
    <div className="h-screen w-screen relative flex items-center justify-center overflow-hidden">
      {/* Liquid Glass Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Subtle animated gradient overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* App Title */}
        <div className="text-center">
          <h1
            className="text-6xl font-bold text-white mb-3"
            style={{
              textShadow: '0 2px 20px rgba(167, 139, 250, 0.4)',
              letterSpacing: '-0.02em',
            }}
          >
            DevFocus
          </h1>
          <p className="text-white/60 text-sm font-medium tracking-wider uppercase">
            Task Management System
          </p>
        </div>

        {/* Simple Spinner */}
        <div className="relative">
          <div
            className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"
            style={{
              borderWidth: '3px',
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;
