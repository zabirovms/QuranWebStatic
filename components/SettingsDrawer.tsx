'use client';

import { useState, useEffect } from 'react';
import { SettingsService, AppSettings } from '@/lib/services/settings-service';
import { 
  CloseIcon, 
  PaletteIcon
} from './Icons';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const settingsService = SettingsService.getInstance();
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(settingsService.getSettings());
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const methodName = `set${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof SettingsService;
    const method = settingsService[methodName] as (value: any) => void;
    if (method) {
      method(value);
      setSettings(settingsService.getSettings());
    }
  };

  const getThemeName = (theme: string): string => {
    switch (theme) {
      case 'newLight': return 'Равшан';
      case 'newDark': return 'Торик';
      case 'light': return 'Classic Light';
      case 'dark': return 'Classic Dark';
      case 'softBeige': return 'Soft Beige';
      case 'elegantMarble': return 'Elegant Marble';
      case 'nightSky': return 'Night Sky';
      case 'silverLight': return 'Silver Light';
      default: return 'Равшан';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '360px',
          backgroundColor: 'var(--color-background)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          zIndex: 2001,
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--color-background)',
            borderBottom: '1px solid var(--color-outline)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-container-low-opacity)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PaletteIcon size={24} color="var(--color-primary)" />
            </div>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              Намуди зоҳирӣ
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Пӯшидан"
          >
            <CloseIcon size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: '20px',
            lineHeight: '1.5',
          }}>
            Интихоби намуди зоҳирӣ барои таҷрибаи беҳтарини хондан
          </div>
          
          <ThemeSelector
            currentTheme={settings.theme}
            onSelect={(theme) => {
              try {
                settingsService.setTheme(theme);
                setSettings(settingsService.getSettings());
              } catch (error) {
                console.error('Error updating theme:', error);
              }
            }}
            getThemeName={getThemeName}
          />
        </div>
      </div>

    </>
  );
}

// Theme Selector Component
function ThemeSelector({
  currentTheme,
  onSelect,
  getThemeName,
}: {
  currentTheme: string;
  onSelect: (theme: string) => void;
  getThemeName: (theme: string) => string;
}) {
  const themes = [
    { value: 'newLight', label: 'Равшан', description: 'Намуди равшани асосӣ' },
    { value: 'newDark', label: 'Торик', description: 'Намуди торики асосӣ' },
    { value: 'light', label: 'Classic Light', description: 'Намуди равшани классикӣ' },
    { value: 'dark', label: 'Classic Dark', description: 'Намуди торики классикӣ' },
    { value: 'softBeige', label: 'Soft Beige', description: 'Намуди бежӣ' },
    { value: 'elegantMarble', label: 'Elegant Marble', description: 'Намуди мармарӣ' },
    { value: 'nightSky', label: 'Night Sky', description: 'Намуди осмони шаб' },
    { value: 'silverLight', label: 'Silver Light', description: 'Намуди нуқраӣ' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {themes.map((theme) => {
        const isSelected = currentTheme === theme.value;
        return (
          <div
            key={theme.value}
            onClick={() => onSelect(theme.value)}
            style={{
              padding: '16px',
              backgroundColor: isSelected ? 'var(--color-primary-container-low-opacity)' : 'var(--color-surface-variant)',
              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-outline)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.borderColor = 'var(--color-primary-low-opacity)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                e.currentTarget.style.borderColor = 'var(--color-outline)';
              }
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: isSelected ? '6px solid var(--color-primary)' : '2px solid var(--color-outline)',
              backgroundColor: isSelected ? 'var(--color-primary-container)' : 'transparent',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 'var(--font-size-md)',
                fontWeight: isSelected ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}>
                {theme.label}
              </div>
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
              }}>
                {theme.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}



