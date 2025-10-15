import React from 'react';
import { X } from 'lucide-react';

interface WindowLayoutProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  showBackground?: boolean;
  backgroundImage?: string;
  overlayOpacity?: number;
  className?: string;
}

/**
 * WindowLayout Component
 *
 * Unified layout for all custom windows in DevFocus.
 * Provides consistent structure with background, title bar, and scrollable content area.
 *
 * @param title - Window title displayed in the title bar
 * @param onClose - Callback function when close button is clicked
 * @param children - Content to be rendered in the scrollable area
 * @param showBackground - Whether to show the background image (default: true)
 * @param backgroundImage - Path to background image (default: /assets/image/background.jpg)
 * @param overlayOpacity - Opacity of dark overlay (default: 0.4)
 * @param className - Additional CSS classes for the content wrapper
 */
export const WindowLayout: React.FC<WindowLayoutProps> = ({
  title,
  onClose,
  children,
  showBackground = true,
  backgroundImage = '/assets/image/background.jpg',
  overlayOpacity = 0.4,
  className = '',
}) => {
  return (
    <div className="h-screen w-screen relative flex flex-col overflow-hidden font-sans">
      {/* Background Image */}
      {showBackground && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'auto',
            backgroundRepeat: 'repeat',
          }}
        />
      )}

      {/* Dark overlay for better contrast */}
      {showBackground && (
        <div
          className="fixed inset-0 z-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Custom Title Bar */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-3 bg-glass-primary backdrop-blur-md border-b border-glass-border text-white cursor-move flex-shrink-0"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <span className="font-semibold">{title}</span>
        </div>
        <button
          type="button"
          aria-label="Close window"
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors pl-3 pointer-events-auto"
          data-tauri-drag-region-exclude
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className={`p-6 ${className}`}>{children}</div>
      </div>
    </div>
  );
};
