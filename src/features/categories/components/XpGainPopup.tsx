import React, { useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';

export const XpGainPopup: React.FC = () => {
  const { activeXpGains, removeXpGainAnimation } = useCategoryStore();

  useEffect(() => {
    if (activeXpGains.length === 0) return;

    // Remove oldest animation after 2 seconds
    const timer = setTimeout(() => {
      const oldest = activeXpGains[0];
      if (oldest) {
        removeXpGainAnimation(oldest.id);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [activeXpGains, removeXpGainAnimation]);

  if (activeXpGains.length === 0) return null;

  return (
    <div className="fixed top-20 right-8 z-50 pointer-events-none">
      <div className="flex flex-col gap-2">
        {activeXpGains.map((gain, index) => (
          <div
            key={gain.id}
            className="animate-float-up"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div
              className="px-4 py-2 rounded-full font-bold text-white shadow-lg"
              style={{
                backgroundColor: gain.categoryColor,
                boxShadow: `0 4px 12px ${gain.categoryColor}40`,
              }}
            >
              +{gain.xpAmount} XP {gain.categoryName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
