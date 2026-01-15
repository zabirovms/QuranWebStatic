'use client';

import { useState, useRef, useEffect } from 'react';
import { SettingsService } from '@/lib/services/settings-service';

interface TranslationDropdownProps {
  currentTranslation: string;
  onTranslationSelected: (translation: string) => void;
  trigger: React.ReactNode;
}

const translationNames: Record<string, string> = {
  'tajik': 'Абдул Муҳаммад Оятӣ',
  'tj_2': 'Абуаломуддин (бо тафсир)',
  'tj_3': 'Pioneers of Translation Center',
  'farsi': 'Форсӣ',
  'russian': 'Эльмир Кулиев',
};

const translations = [
  { value: 'tajik', label: translationNames['tajik'] },
  { value: 'tj_2', label: translationNames['tj_2'] },
  { value: 'tj_3', label: translationNames['tj_3'] },
  { value: 'farsi', label: translationNames['farsi'] },
  { value: 'russian', label: translationNames['russian'] },
];

export default function TranslationDropdown({
  currentTranslation,
  onTranslationSelected,
  trigger,
}: TranslationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const settingsService = SettingsService.getInstance();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position to keep it within viewport
  useEffect(() => {
    if (isOpen && triggerRef.current && dropdownRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dropdownWidth = 280; // minWidth
      const dropdownHeight = Math.min(300, viewportHeight - 200);
      
      let right = 0;
      let left: number | undefined = undefined;
      
      // Check if dropdown would go off-screen on the right
      const style: React.CSSProperties = {
        position: 'fixed',
        minWidth: '280px',
        maxWidth: `min(400px, calc(100vw - 32px))`,
        maxHeight: `${dropdownHeight}px`,
      };
      
      if (triggerRect.right - dropdownWidth < 16) {
        // Position from left edge instead
        style.left = `${Math.max(16, triggerRect.left)}px`;
      } else {
        style.right = `${Math.max(16, viewportWidth - triggerRect.right)}px`;
      }
      
      // Check if dropdown would go off-screen on the bottom
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        style.top = `${Math.max(16, triggerRect.top - dropdownHeight - 8)}px`;
      } else {
        style.top = `${triggerRect.bottom + 4}px`;
      }
      
      setDropdownStyle(style);
    }
  }, [isOpen]);

  const handleSelect = (translation: string) => {
    settingsService.setTranslationLanguage(translation as any);
    onTranslationSelected(translation);
    setIsOpen(false);
  };

  const getCurrentLabel = () => {
    return translationNames[currentTranslation] || currentTranslation;
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        {trigger}
      </div>
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2002,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            style={{
              ...dropdownStyle,
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-outline)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--elevation-8)',
              minWidth: '280px',
              width: 'max-content',
              zIndex: 2003,
              overflow: 'hidden',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {translations.map((translation) => (
              <div
                key={translation.value}
                onClick={() => handleSelect(translation.value)}
                style={{
                  padding: 'var(--spacing-md)',
                  cursor: 'pointer',
                  backgroundColor: currentTranslation === translation.value
                    ? 'var(--color-primary-container-low-opacity)'
                    : 'transparent',
                  borderBottom: '1px solid var(--color-outline)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (currentTranslation !== translation.value) {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTranslation !== translation.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: currentTranslation === translation.value
                    ? 'var(--font-weight-semibold)'
                    : 'var(--font-weight-normal)',
                  color: currentTranslation === translation.value
                    ? 'var(--color-primary)'
                    : 'var(--color-text-primary)',
                }}>
                  {translation.label}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

