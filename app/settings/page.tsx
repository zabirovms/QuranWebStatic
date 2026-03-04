'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsService, AppSettings } from '@/lib/services/settings-service';
import { ArrowBackIcon, PaletteIcon, NotificationsActiveOutlinedIcon, InfoIcon, FavoriteIcon, ArrowForwardIosIcon, CloudIcon, LanguageIcon, AudiotrackIcon, PersonIcon, LibraryBooksIcon, InstagramIcon, FacebookIcon, YouTubeIcon, EmailIcon, CheckCircleIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';

const APP_VERSION = '1.1.4';

export default function SettingsPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const settingsService = SettingsService.getInstance();
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());
  const [showNotificationsSheet, setShowNotificationsSheet] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  useEffect(() => {
    setSettings(settingsService.getSettings());
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

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

  const activeNotificationCount = [
    settings.weeklyReminderEnabled ? 1 : null,
    settings.dailyRemindersEnabled ? 1 : null,
  ].filter(x => x !== null).length;

  const notificationSubtitle = activeNotificationCount === 0
    ? 'Ҳамаи огоҳиномаҳo ғайрифаъоланд'
    : `${activeNotificationCount} огоҳиномаи фаъол`;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* AppBar */}
      <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
        <div className="app-bar-content">
          <button
            onClick={handleBack}
            className="btn btn-icon"
            style={{ marginRight: 'var(--spacing-sm)' }}
            title="Баргаштан"
          >
            <ArrowBackIcon size={24} color="var(--color-primary)" />
          </button>
          <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'center' }}>
            Танзимот
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        padding: 'var(--spacing-lg) 0',
        paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-lg))' : 'calc(56px + var(--spacing-lg))',
      }}>
        {/* Display Settings */}
        <SectionHeader title="Намоиш" />
        <SectionCard>
          <SettingTile
            icon={<PaletteIcon size={24} color="var(--color-primary)" />}
            title="Намуди зоҳирӣ"
            subtitle={getThemeName(settings.theme)}
            onTap={() => requestAnimationFrame(() => setShowThemeDialog(true))}
          />
        </SectionCard>
        <div style={{ height: '4px' }} />

        {/* Notifications */}
        <SectionHeader title="Огоҳиномаҳo" />
        <SectionCard>
          <SettingTile
            icon={<NotificationsActiveOutlinedIcon size={24} color="var(--color-primary)" />}
            title="Идоракунии огоҳиномаҳo"
            subtitle={notificationSubtitle}
            onTap={() => requestAnimationFrame(() => setShowNotificationsSheet(true))}
          />
        </SectionCard>
        <div style={{ height: '4px' }} />

        {/* About */}
        <SectionHeader title="Дар бораи барнома" />
        <SectionCard>
          <SettingTile
            icon={<InfoIcon size={24} color="var(--color-primary)" />}
            title="Дар бораи барнома"
            subtitle={`Версия ${APP_VERSION}`}
            onTap={() => requestAnimationFrame(() => setShowAboutDialog(true))}
          />
          <div style={{ height: '12px' }} />
          <SettingTile
            icon={<span style={{ fontSize: '24px' }}>📱</span>}
            title="Барномаи мобилӣ"
            subtitle="Боргирӣ аз Play Store"
            onTap={() => window.open('https://play.google.com/store/apps/details?id=com.quran.tj.quranapp', '_blank', 'noopener,noreferrer')}
          />
        </SectionCard>
        <div style={{ height: '4px' }} />

        {/* Special Thanks */}
        <SectionHeader title="Ташаккури махсус ба:" />
        <SectionCard>
          <ThanksTile
            icon={<CloudIcon size={24} color="#2196F3" />}
            title="AlQuran Cloud"
            subtitle="Матни Қуръон ва тарҷумаҳо"
            url="https://alquran.cloud/"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<LanguageIcon size={24} color="#4CAF50" />}
            title="Tanzil.net"
            subtitle="Матни Қуръон ва тарҷумаҳо"
            url="https://tanzil.net/"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<AudiotrackIcon size={24} color="#FF9800" />}
            title="CDN Islamic Network"
            subtitle="Аудиоҳои Қуръон"
            url="https://alquran.cloud/cdn"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<PersonIcon size={24} color="#0088CC" />}
            title="Акмал Мансуров"
            subtitle="Аудиоҳо бо тарҷумаи тоҷикӣ"
            url="https://t.me/Qurantajik"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<PersonIcon size={24} color="#009688" />}
            title="Абуаломуддин"
            subtitle="Тафсири осонбаён - Муаллиф ва мутарҷим"
            url={null}
            disabled
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<LibraryBooksIcon size={24} color="#9C27B0" />}
            title="Quranic Universal Library"
            subtitle="Тарҷумаи калима ба калима"
            url="https://qul.tarteel.ai/"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<FavoriteIcon size={24} color="#FF0000" />}
            title="Дигар манбаъҳо"
            subtitle="Ҳамаи манбаъҳои онлайн"
            url={null}
            disabled
          />
          <div style={{ height: '16px' }} />
          <div style={{
            padding: '0 16px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: '1.5',
          }}>
            Ҳамаи ҳуқуқҳо ба муаллифон ва манбаъҳои мутобиқ тааллуқ доранд. Маводҳо дар ин барнома аз манбаъҳои гуногун ҷамъоварӣ шудаанд, аз ҷумла: матни Қуръон, тарҷумаҳо, қироатҳои аудиоӣ ва тафсир.
          </div>
        </SectionCard>
        <div style={{ height: '4px' }} />

        {/* Social Links */}
        <SectionHeader title="Мо дар:" />
        <SectionCard>
          <ThanksTile
            icon={<InstagramIcon size={24} color="#E4405F" />}
            title="Instagram"
            subtitle="@quran.tj.official"
            url="https://www.instagram.com/quran.tj.official"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<FacebookIcon size={24} color="#1877F2" />}
            title="Facebook"
            subtitle="Ба наздикӣ..."
            url={null}
            disabled
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<YouTubeIcon size={24} color="#FF0000" />}
            title="YouTube"
            subtitle="Balkhiverse"
            url="https://www.youtube.com/@balkhiverse"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<LanguageIcon size={24} color="var(--color-primary)" />}
            title="Вебсайт"
            subtitle="www.quran.tj"
            url="https://www.quran.tj"
          />
          <div style={{ height: '12px' }} />
          <ThanksTile
            icon={<EmailIcon size={24} color="var(--color-primary)" />}
            title="Тамос"
            subtitle="info@quran.tj"
            url="mailto:info@quran.tj?subject=Тамос%20бо%20барномаи%20Қуръон"
          />
        </SectionCard>
        <div style={{ height: '20px' }} />
      </div>

      {/* Notifications Bottom Sheet */}
      {showNotificationsSheet && (
        <NotificationsBottomSheet
          settings={settings}
          onUpdate={updateSetting}
          onClose={() => setShowNotificationsSheet(false)}
        />
      )}

      {/* Theme Dialog */}
      {showThemeDialog && (
        <ThemeDialog
          currentTheme={settings.theme}
          onSelect={(theme) => {
            try {
              settingsService.setTheme(theme);
              setSettings(settingsService.getSettings());
              setShowThemeDialog(false);
            } catch (error) {
              console.error('Error updating theme:', error);
            }
          }}
          onClose={() => setShowThemeDialog(false)}
        />
      )}

      {/* About Dialog */}
      {showAboutDialog && (
        <AboutDialog
          onClose={() => setShowAboutDialog(false)}
        />
      )}

    </div>
  );
}

// Section Header Component
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      padding: '8px 16px 4px',
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text-secondary)',
      }}>
        {title}
      </div>
    </div>
  );
}

// Section Card Component
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: '0 16px',
      padding: '16px',
      backgroundColor: 'var(--color-surface-variant)',
      borderRadius: '18px',
      border: '1px solid var(--color-outline)',
    }}>
      {children}
    </div>
  );
}

// Setting Tile Component
function SettingTile({
  icon,
  title,
  subtitle,
  onTap,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onTap: () => void;
}) {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 0',
        cursor: 'pointer',
      }}
    >
      <div style={{ marginRight: '16px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          {subtitle}
        </div>
      </div>
      <ArrowForwardIosIcon size={16} color="var(--color-text-secondary)" />
    </div>
  );
}

// Thanks Tile Component
function ThanksTile({
  icon,
  title,
  subtitle,
  url,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  url: string | null;
  disabled?: boolean;
}) {
  const handleTap = () => {
    if (!disabled && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 0',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ marginRight: '16px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          {subtitle}
        </div>
      </div>
      {!disabled && (
        <ArrowForwardIosIcon size={16} color="var(--color-text-secondary)" />
      )}
    </div>
  );
}

// Notifications Bottom Sheet Component
function NotificationsBottomSheet({
  settings,
  onUpdate,
  onClose,
}: {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-background)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          width: '100%',
          maxHeight: '80vh',
          padding: '12px 16px calc(16px + 24px)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div style={{
          width: '48px',
          height: '5px',
          backgroundColor: 'var(--color-text-secondary)',
          borderRadius: '12px',
          margin: '0 auto 16px',
        }} />

        {/* Title */}
        <div style={{
          fontSize: '18px',
          fontWeight: 'var(--font-weight-semibold)',
          textAlign: 'center',
          marginBottom: '12px',
        }}>
          Огоҳиномаҳo
        </div>

        {/* Weekly Reminder */}
        <NotificationCard
          title="Хотиррасонии Ҷумъа"
          isActive={settings.weeklyReminderEnabled}
          onToggle={(value) => onUpdate('weeklyReminderEnabled', value)}
        />

        <div style={{ height: '12px' }} />

        {/* Daily Reminders */}
        <NotificationCard
          title="Дуо ва ояти рӯз"
          isActive={settings.dailyRemindersEnabled}
          onToggle={(value) => onUpdate('dailyRemindersEnabled', value)}
        />

        <div style={{ height: '12px' }} />

      </div>
    </div>
  );
}

// Notification Card Component
function NotificationCard({
  title,
  isActive,
  onToggle,
  children,
}: {
  title: string;
  isActive: boolean;
  onToggle: (value: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface-variant)',
      borderRadius: '16px',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: children ? '12px' : 0,
      }}>
        <div style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
        }}>
          {title}
        </div>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <div
            onClick={() => onToggle(!isActive)}
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-outline)',
              position: 'relative',
              transition: 'background-color 0.3s',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface)',
                position: 'absolute',
                top: '2px',
                left: isActive ? '22px' : '2px',
                transition: 'left 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </label>
      </div>
      {children}
    </div>
  );
}


// Theme Dialog Component
function ThemeDialog({
  currentTheme,
  onSelect,
  onClose,
}: {
  currentTheme: string;
  onSelect: (theme: string) => void;
  onClose: () => void;
}) {
  const themes = [
    { value: 'newLight', label: 'Равшан' },
    { value: 'newDark', label: 'Торик' },
    { value: 'light', label: 'Classic Light' },
    { value: 'dark', label: 'Classic Dark' },
    { value: 'softBeige', label: 'Soft Beige' },
    { value: 'elegantMarble', label: 'Elegant Marble' },
    { value: 'nightSky', label: 'Night Sky' },
    { value: 'silverLight', label: 'Silver Light' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: '16px',
        }}>
          Намуди зоҳирӣ
        </div>
        {themes.map((theme) => (
          <label
            key={theme.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="theme"
              value={theme.value}
              checked={currentTheme === theme.value}
              onChange={() => onSelect(theme.value)}
              style={{
                marginRight: '12px',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
              }}
            />
            <span style={{
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-text-primary)',
            }}>
              {theme.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// About Dialog Component
function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: '16px',
        }}>
          Дар бораи барнома
        </div>
        <div style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: '4px',
        }}>
          Қуръон бо Тафсири Осонбаён
        </div>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          marginBottom: '12px',
        }}>
          Версия {APP_VERSION}
        </div>
        <div style={{
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.6',
          marginBottom: '16px',
        }}>
          Ин барномаи мобилӣ барои хондан ва фаҳмидани Қуръон бо тарҷумаи тоҷикӣ ва тафсири осонбаён мебошад.
        </div>
        {/* Add more content as needed */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: '8px',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          Пӯшидан
        </button>
      </div>
    </div>
  );
}
