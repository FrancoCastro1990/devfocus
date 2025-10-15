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
              className="px-4 py-2 border font-sans font-bold rounded-xl backdrop-blur-md"
              style={{
                borderColor: `${gain.categoryColor}60`,
                color: gain.categoryColor,
                backgroundColor: `${gain.categoryColor}15`,
              }}
            >
              +{gain.xpAmount} XP [{gain.categoryName}]
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
