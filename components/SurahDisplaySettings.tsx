'use client';

import { useState, useEffect } from 'react';
import { SettingsService } from '@/lib/services/settings-service';
import { CloseIcon, TranslateIcon, RecordVoiceOverIcon, TextFieldsIcon, FormatListBulletedIcon } from './Icons';
import TranslationDropdown from './TranslationDropdown';
import ReciterDropdown from './ReciterDropdown';
import { getReciterById, Reciter } from '@/lib/data/reciter-data-client';

interface SurahDisplaySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: SurahDisplaySettings) => void;
}

export interface SurahDisplaySettings {
  showTransliteration: boolean;
  showTranslation: boolean;
  showOnlyArabic: boolean;
  isWordByWordMode: boolean;
  showVerseActions: boolean;
  plainCardsMode: boolean;
  translationLanguage: string;
  audioEdition: string;
}

export default function SurahDisplaySettings({
  isOpen,
  onClose,
  onSettingsChange,
}: SurahDisplaySettingsProps) {
  const settingsService = SettingsService.getInstance();
  const [settings, setSettings] = useState<SurahDisplaySettings>({
    showTransliteration: settingsService.getSettings().showTransliteration,
    showTranslation: settingsService.getSettings().showTranslation,
    showOnlyArabic: settingsService.getSettings().showOnlyArabic,
    isWordByWordMode: settingsService.getSettings().wordByWordMode,
    showVerseActions: true, // Always true - actions visible by default, toggle removed from settings
    plainCardsMode: true, // Always true - default/main mode
    translationLanguage: settingsService.getSettings().translationLanguage,
    audioEdition: settingsService.getSettings().audioEdition,
  });
  const [reciterName, setReciterName] = useState<string>('Қорӣ');

  // Load settings from service when drawer opens
  useEffect(() => {
    if (isOpen) {
      const currentSettings = settingsService.getSettings();
      setSettings({
        showTransliteration: currentSettings.showTransliteration,
        showTranslation: currentSettings.showTranslation,
        showOnlyArabic: currentSettings.showOnlyArabic,
        isWordByWordMode: currentSettings.wordByWordMode,
        showVerseActions: true, // Always true - actions visible by default, toggle removed from settings
        plainCardsMode: true, // Always true - default/main mode
        translationLanguage: currentSettings.translationLanguage,
        audioEdition: currentSettings.audioEdition,
      });
      
      // Load reciter name
      loadReciterName(currentSettings.audioEdition);
    }
  }, [isOpen, settingsService]);

  const loadReciterName = async (reciterId: string) => {
    try {
      const reciter = await getReciterById(reciterId);
      if (reciter) {
        const displayName = reciter.nameTajik && reciter.nameTajik !== reciter.id
          ? reciter.nameTajik
          : (reciter.name && reciter.name !== reciter.id ? reciter.name : 'Қорӣ');
        setReciterName(displayName);
      } else {
        setReciterName('Қорӣ');
      }
    } catch (error) {
      console.error('Error loading reciter name:', error);
      setReciterName('Қорӣ');
    }
  };

  const handleToggle = (key: keyof SurahDisplaySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    
    // Handle mutual exclusivity (matching Flutter logic)
    if (key === 'showTransliteration' && value) {
      newSettings.showOnlyArabic = false;
      newSettings.isWordByWordMode = false;
      // Save to service
      settingsService.setShowTransliteration(true);
      settingsService.setShowOnlyArabic(false);
      settingsService.setWordByWordMode(false);
    } else if (key === 'showTranslation' && value) {
      newSettings.showOnlyArabic = false;
      newSettings.isWordByWordMode = false;
      // Save to service
      settingsService.setShowTranslation(true);
      settingsService.setShowOnlyArabic(false);
      settingsService.setWordByWordMode(false);
    } else if (key === 'showOnlyArabic' && value) {
      newSettings.showTransliteration = false;
      newSettings.showTranslation = false;
      // Save to service
      settingsService.setShowOnlyArabic(true);
      settingsService.setShowTransliteration(false);
      settingsService.setShowTranslation(false);
    } else if (key === 'isWordByWordMode' && value) {
      newSettings.showTransliteration = false;
      newSettings.showTranslation = false;
      // Save to service
      settingsService.setWordByWordMode(true);
      settingsService.setShowTransliteration(false);
      settingsService.setShowTranslation(false);
    } else if (key === 'showOnlyArabic' && !value) {
      // When turning off "show only arabic", turn on transliteration and translation
      newSettings.showTransliteration = true;
      newSettings.showTranslation = true;
      settingsService.setShowTransliteration(true);
      settingsService.setShowTranslation(true);
    } else if (key === 'isWordByWordMode' && !value) {
      // When turning off word by word, turn on transliteration and translation
      newSettings.showTransliteration = true;
      newSettings.showTranslation = true;
      settingsService.setShowTransliteration(true);
      settingsService.setShowTranslation(true);
    }
    
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleTranslationSelected = (translation: string) => {
    const newSettings = { ...settings, translationLanguage: translation };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    settingsService.setTranslationLanguage(translation);
  };

  const handleReciterSelected = async (reciterId: string) => {
    const newSettings = { ...settings, audioEdition: reciterId };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    settingsService.setAudioEdition(reciterId);
    await loadReciterName(reciterId);
  };

  const getTranslationLanguageName = (lang: string): string => {
    const names: Record<string, string> = {
      'tajik': 'Абдул Муҳаммад Оятӣ',
      'tj_2': 'Абуаломуддин (бо тафсир)',
      'tj_3': 'Pioneers of Translation Center',
      'farsi': 'Форсӣ',
      'russian': 'Эльмир Кулиев',
    };
    return names[lang] || lang;
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
          maxWidth: '400px',
          backgroundColor: 'var(--color-background)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          zIndex: 2001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            margin: 0,
            }}
          >
            Танзимоти намоиш
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease',
              color: 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <CloseIcon size={24} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-lg)',
            paddingBottom: 'var(--spacing-2xl)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Section: Audio & Translation */}
          <div style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--spacing-md)',
            paddingLeft: 'var(--spacing-xs)',
          }}>
            Аудио ва тарҷума
        </div>

        {/* Translation Language */}
          <TranslationDropdown
            currentTranslation={settings.translationLanguage}
            onTranslationSelected={handleTranslationSelected}
            trigger={
        <SettingTile
          icon={<TranslateIcon size={24} color="var(--color-primary)" />}
          title="Забони тарҷума"
          value={getTranslationLanguageName(settings.translationLanguage)}
                onClick={() => {}}
              />
            }
        />

          <div style={{ height: 'var(--spacing-md)' }} />

        {/* Qari Selection */}
          <ReciterDropdown
            currentReciterId={settings.audioEdition}
            onReciterSelected={handleReciterSelected}
            trigger={
        <SettingTile
          icon={<RecordVoiceOverIcon size={24} color="var(--color-primary)" />}
          title="Қори"
          value={reciterName}
                onClick={() => {}}
              />
            }
          />

          <div style={{ 
            height: '1px', 
            backgroundColor: 'var(--color-outline)', 
            margin: 'var(--spacing-xl) 0',
          }} />

          {/* Section: Display Options */}
          <div style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--spacing-md)',
            paddingLeft: 'var(--spacing-xs)',
          }}>
            Намоиш
          </div>

        {/* Show Transliteration */}
        <SwitchTile
          icon={<TextFieldsIcon size={24} color="var(--color-primary)" />}
          title="Намоиши транслитератсия"
          value={settings.showTransliteration && !settings.isWordByWordMode && !settings.showOnlyArabic}
          onChange={(value) => handleToggle('showTransliteration', value)}
        />

          <div style={{ height: 'var(--spacing-md)' }} />

        {/* Show Translation */}
        <SwitchTile
          icon={<TranslateIcon size={24} color="var(--color-primary)" />}
          title="Намоиши тарҷума"
          value={settings.showTranslation && !settings.showOnlyArabic && !settings.isWordByWordMode}
          onChange={(value) => handleToggle('showTranslation', value)}
        />

          <div style={{ height: 'var(--spacing-md)' }} />

        {/* Show Only Arabic */}
        <SwitchTile
          icon={<TextFieldsIcon size={24} color="var(--color-primary)" />}
          title="Намоиши танҳо матни арабӣ"
          value={settings.showOnlyArabic}
          onChange={(value) => handleToggle('showOnlyArabic', value)}
        />

          <div style={{ height: 'var(--spacing-md)' }} />

        {/* Word by Word Mode */}
        <SwitchTile
          icon={<FormatListBulletedIcon size={24} color="var(--color-primary)" />}
          title="Ҳолати калима ба калима"
          value={settings.isWordByWordMode}
          onChange={(value) => handleToggle('isWordByWordMode', value)}
        />

        </div>
      </div>

    </>
  );
}

function SettingTile({ icon, title, value, onClick }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface-variant)',
        border: '1px solid var(--color-outline)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        e.currentTarget.style.boxShadow = 'var(--elevation-2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ 
        marginRight: 'var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: 'var(--font-size-base)', 
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--color-text-secondary)', 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {value}
        </div>
      </div>
      <div style={{ 
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-lg)',
        marginLeft: 'var(--spacing-sm)',
      }}>
        ›
      </div>
    </div>
  );
}

function SwitchTile({ icon, title, subtitle, value, onChange }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface-variant)',
        border: '1px solid var(--color-outline)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ 
        marginRight: 'var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: 'var(--font-size-base)', 
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: subtitle ? '4px' : 0,
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--color-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </div>
        )}
      </div>
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '52px',
        height: '28px',
        cursor: 'pointer',
        flexShrink: 0,
        marginLeft: 'var(--spacing-md)',
      }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            opacity: 0,
            width: 0,
            height: 0,
            position: 'absolute',
          }}
        />
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: value ? 'var(--color-primary)' : 'var(--color-outline)',
          borderRadius: '28px',
          transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <span style={{
            position: 'absolute',
            height: '22px',
            width: '22px',
            left: value ? '26px' : '3px',
            top: '3px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }} />
        </span>
      </label>
    </div>
  );
}
