import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

/**
 * Select Component
 *
 * A custom select dropdown with liquid glass styling.
 * Replaces native <select> elements to provide full control over dropdown styling.
 *
 * @param value - Currently selected value
 * @param onChange - Callback when selection changes
 * @param options - Array of options with value and label
 * @param placeholder - Optional placeholder text when no value is selected
 * @param className - Additional CSS classes
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false });
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Calculate dropdown position when opening
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 240; // max-h-60 = 240px
    const gap = 8;
    const viewportHeight = window.innerHeight;

    // Check if there's enough space below
    const spaceBelow = viewportHeight - buttonRect.bottom - gap;
    const spaceAbove = buttonRect.top - gap;
    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setDropdownPosition({
      top: openUpward ? buttonRect.top - gap : buttonRect.bottom + gap,
      left: buttonRect.left,
      width: buttonRect.width,
      openUpward,
    });
  }, []);

  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      // Close dropdown on scroll (standard behavior)
      setIsOpen(false);
    };

    const handleResize = () => {
      // Close dropdown on resize (standard behavior)
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full text-left transition-all font-sans font-medium border-2"
        style={{
          background: isOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: isOpen ? 'rgba(147, 197, 253, 0.5)' : 'rgba(255, 255, 255, 0.25)',
          borderRadius: '0.875rem',
          padding: '0.75rem 1rem',
          color: '#ffffff',
          boxShadow: isOpen
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 3px rgba(147, 197, 253, 0.25), 0 0 30px rgba(147, 197, 253, 0.3)'
            : 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transform: isOpen ? 'translateY(-1px)' : 'none',
        }}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-white' : 'text-white/60'}>
            {displayText}
          </span>
          <ChevronDown
            size={16}
            className="transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="overflow-hidden animate-scale-in"
          style={{
            position: 'fixed',
            [dropdownPosition.openUpward ? 'bottom' : 'top']: dropdownPosition.openUpward
              ? `${window.innerHeight - dropdownPosition.top}px`
              : `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999,
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.875rem',
            boxShadow:
              '0 12px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.2)',
            transformOrigin: dropdownPosition.openUpward ? 'bottom' : 'top',
          }}
        >
          <div className="max-h-60 overflow-y-auto py-2">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className="w-full text-left px-4 py-2.5 transition-all font-sans font-medium"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)'
                      : 'transparent',
                    color: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
