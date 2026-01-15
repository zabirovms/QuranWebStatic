'use client';

import { useState } from 'react';
import { SettingsService } from '@/lib/services/settings-service';
import { CloseIcon } from './Icons';

interface TranslationSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTranslation: string;
  onTranslationSelected: (translation: string) => void;
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

export default function TranslationSelectionDialog({
  isOpen,
  onClose,
  currentTranslation,
  onTranslationSelected,
}: TranslationSelectionDialogProps) {
  const settingsService = SettingsService.getInstance();
  const [selectedTranslation, setSelectedTranslation] = useState(currentTranslation);

  if (!isOpen) return null;

  const handleSelect = (translation: string) => {
    setSelectedTranslation(translation);
    settingsService.setTranslationLanguage(translation as any);
    onTranslationSelected(translation);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '400px',
          width: '90%',
          maxHeight: '80vh',
          padding: 'var(--spacing-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--spacing-md)',
            right: 'var(--spacing-md)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--spacing-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloseIcon size={24} color="var(--color-text-secondary)" />
        </button>

        <h2 className="headline-medium" style={{ marginBottom: 'var(--spacing-xl)' }}>
          Интихоби забони тарҷума
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          {translations.map((translation) => (
            <label
              key={translation.value}
              onClick={() => handleSelect(translation.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background-color var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <input
                type="radio"
                name="translation"
                value={translation.value}
                checked={selectedTranslation === translation.value}
                onChange={() => handleSelect(translation.value)}
                style={{
                  marginRight: 'var(--spacing-md)',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              <span className="body-medium">{translation.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

