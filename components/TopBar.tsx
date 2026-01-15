'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuIcon, CloseIcon, PaletteIcon, SearchIcon, NavigationIcon } from './Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import SettingsDrawer from './SettingsDrawer';
import SearchDrawer from './SearchDrawer';
import NavigationDrawer from './NavigationDrawer';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const { isVisible } = useTopBar();

  const navItems = [
    { href: '/', label: 'Асосӣ', icon: '🏠', id: 'home' },
    { href: '/quran', label: 'Қуръон', icon: '📖', id: 'quran' },
    { href: '/learn-words', label: 'Омӯзиш', icon: '📚', id: 'learn' },
    { href: '/audio-home', label: 'Қироат', icon: '🎵', id: 'audio' },
  ];

  const homeSections = [
    { href: '/quoted-verses', label: 'Иқтибосҳо аз Қуръон', icon: '💬', id: 'quoted-verses' },
    { href: '/tasbeeh', label: 'Зикрҳо', icon: '📿', id: 'tasbeeh' },
    { href: '/prophets', label: 'Пайғамбарон', icon: '👤', id: 'prophets' },
    { href: '/duas', label: 'Дуоҳо', icon: '🙏', id: 'duas' },
    { href: '/asmaul-husna', label: 'Асмоул Ҳусно', icon: '✨', id: 'asmaul-husna' },
    { href: '/gallery', label: 'Галерея', icon: '🖼️', id: 'gallery' },
    { href: '/downloads', label: 'Махзани Маърифат', icon: '📚', id: 'downloads' },
    { href: 'https://play.google.com/store/apps/details?id=com.quran.tj.quranapp', label: 'Барномаи мобилӣ', icon: '📱', id: 'mobile-app', external: true },
    { href: '/#live-streams', label: 'Пахшҳои зинда', icon: '📺', id: 'live-streams' },
    { href: '/#youtube-videos', label: 'Видеоҳои YouTube', icon: '▶️', id: 'youtube-videos' },
  ];

  const getActiveIndex = () => {
    if (!pathname) return 0; // Default to Main Menu
    if (pathname === '/') {
      return 0; // Main Menu
    }
    if (pathname === '/quran' || pathname.startsWith('/surah/')) {
      return 1; // Quran
    }
    if (pathname === '/learn-words') {
      return 2; // Learn Words
    }
    if (pathname === '/audio-home' || pathname.startsWith('/audio-home/')) {
      return 3; // Audio
    }
    return -1; // Not in main nav items
  };

  const getActiveSectionIndex = () => {
    if (!pathname) return -1;
    return homeSections.findIndex(section => 
      pathname === section.href || pathname.startsWith(section.href + '/')
    );
  };

  const activeIndex = getActiveIndex();
  const activeIconColor = 'var(--color-primary)';
  const inactiveIconColor = 'var(--color-text-secondary)';

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <header
        style={{
          position: 'fixed',
          top: isVisible ? 0 : '-56px',
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-outline)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          zIndex: 1000,
          transition: 'top 0.3s ease-in-out',
        }}
      >
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onMouseEnter={() => setIsMenuOpen(true)}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          title="Меню"
        >
          {isMenuOpen ? (
            <CloseIcon size={24} color="var(--color-text-primary)" />
          ) : (
            <MenuIcon size={24} color="var(--color-text-primary)" />
          )}
        </button>

        {/* App Title */}
        <Link
          href="/"
          style={{
            flex: 1,
            marginLeft: '16px',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Quran.tj
        </Link>

        {/* Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            marginLeft: '8px',
          }}
          title="Ҷустуҷӯ"
        >
          <SearchIcon size={24} color="var(--color-text-primary)" />
        </button>

        {/* Navigation Button */}
        <button
          onClick={() => setIsNavigationOpen(true)}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            marginLeft: '8px',
          }}
          title="Навигатсия"
        >
          <NavigationIcon size={24} color="var(--color-text-primary)" />
        </button>

        {/* Info/Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            marginLeft: '8px',
          }}
          title="Танзимот"
        >
          <PaletteIcon size={24} color="var(--color-text-primary)" />
        </button>
      </header>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Menu Panel */}
          <nav
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '80vw',
              backgroundColor: 'var(--color-background)',
              boxShadow: 'var(--elevation-4)',
              zIndex: 2002,
              overflowY: 'auto',
              paddingBottom: '8px',
            }}
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                height: '56px',
                backgroundColor: 'var(--color-background)',
                borderBottom: '1px solid var(--color-outline)',
                zIndex: 1,
              }}
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
                title="Пӯшидан"
              >
                <MenuIcon size={24} color="var(--color-text-primary)" />
              </button>
              <Link
                href="/"
                onClick={handleLinkClick}
                style={{
                  flex: 1,
                  marginLeft: '16px',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Quran.tj
              </Link>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px 0' }}>
            {navItems.map((item, index) => {
              const active = index === activeIndex;
              const iconColor = active ? activeIconColor : inactiveIconColor;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleLinkClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    textDecoration: 'none',
                    color: active ? activeIconColor : inactiveIconColor,
                    backgroundColor: active ? 'var(--color-surface-variant)' : 'transparent',
                    borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: '24px',
                      marginRight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            <div style={{
              height: '1px',
              backgroundColor: 'var(--color-outline)',
              margin: '8px 16px',
            }} />

            {/* Home Page Sections */}
            {homeSections.map((section, index) => {
              const active = index === getActiveSectionIndex();
              const isExternal = (section as any).external === true;
              
              const linkStyle = {
                display: 'flex',
                alignItems: 'center',
                padding: '16px 24px',
                textDecoration: 'none',
                color: active ? activeIconColor : inactiveIconColor,
                backgroundColor: active ? 'var(--color-surface-variant)' : 'transparent',
                borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'background-color 0.2s ease',
              };

              const content = (
                <>
                  <span
                    style={{
                      fontSize: '24px',
                      marginRight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                    }}
                  >
                    {section.icon}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {section.label}
                  </span>
                </>
              );

              if (isExternal) {
                return (
                  <a
                    key={section.id}
                    href={section.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {content}
                  </a>
                );
              }
              
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  onClick={handleLinkClick}
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {content}
                </Link>
              );
            })}
            </div>
          </nav>
        </>
      )}

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Search Drawer */}
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
      />
    </>
  );
}

