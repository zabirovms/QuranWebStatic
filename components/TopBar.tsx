'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuIcon, CloseIcon, PaletteIcon, SearchIcon, NavigationIcon } from './Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import SettingsDrawer from './SettingsDrawer';
import SearchDrawer from './SearchDrawer';
import NavigationDrawer from './NavigationDrawer';
import MagicCurveSidebar, { useSidebarHover } from './MagicCurveSidebar';

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const { isVisible } = useTopBar();
  const isSidebarHovered = useSidebarHover();
  // Default to true (mobile) to ensure sidebar is hidden on first render
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return true; // Default to mobile on SSR to prevent flash
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { href: '/', label: 'Асосӣ', icon: 'home', id: 'home' },
    { href: '/quran', label: 'Қуръон', icon: 'book', id: 'quran' },
    { href: '/bukhari', label: 'Саҳеҳи Бухорӣ', icon: 'library', id: 'bukhari' },
    { href: '/vaqti-namoz', label: 'Вақтҳои намоз', icon: 'time', id: 'prayer-times' },
    { href: '/learn-words', label: 'Омӯзиш', icon: 'school', id: 'learn' },
    { href: '/audio-home', label: 'Қироат', icon: 'musical-notes', id: 'audio' },
  ];

  const homeSections = [
    { href: '/quoted-verses', label: 'Иқтибосҳо аз Қуръон', icon: 'chatbubbles', id: 'quoted-verses' },
    { href: '/tasbeeh', label: 'Зикрҳо', icon: 'ellipse', id: 'tasbeeh' },
    { href: '/prophets', label: 'Пайғамбарон', icon: 'people', id: 'prophets' },
    { href: '/duas', label: 'Дуоҳо', icon: 'heart', id: 'duas' },
    { href: '/asmaul-husna', label: 'Асмоул Ҳусно', icon: 'star', id: 'asmaul-husna' },
    { href: '/gallery', label: 'Галерея', icon: 'images', id: 'gallery' },
    { href: '/downloads', label: 'Махзани Маърифат', icon: 'download', id: 'downloads' },
    { href: 'https://play.google.com/store/apps/details?id=com.quran.tj.quranapp', label: 'Барномаи мобилӣ', icon: 'logo-android', id: 'mobile-app', external: true },
    { href: '/#live-streams', label: 'Пахшҳои зинда', icon: 'tv', id: 'live-streams' },
    { href: '/#youtube-videos', label: 'Видеоҳои YouTube', icon: 'play-circle', id: 'youtube-videos' },
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
          left: isMobile ? 0 : (isSidebarHovered ? '280px' : '64px'),
          right: 0,
          height: '56px',
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-outline)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(12px, 3vw, 16px)',
          gap: 'clamp(8px, 2vw, 12px)',
          zIndex: 1000,
          transition: 'top 0.4s ease-out, left 0.5s ease',
        }}
      >
        {/* Hamburger Menu Button - Only visible on mobile, toggles sidebar */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Кушодани меню"
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
              flexShrink: 0,
            }}
          >
            {isMenuOpen ? (
              <CloseIcon size={24} color="var(--color-text-primary)" />
            ) : (
              <MenuIcon size={24} color="var(--color-text-primary)" />
            )}
          </button>
        )}

        {/* App Title - Only this is clickable */}
        <Link
          href="/"
          style={{
            flex: 1,
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            minWidth: 0,
          }}
        >
          Quran.tj
        </Link>

        {/* Google Play Badge */}
        <a
          href="https://play.google.com/store/apps/details?id=com.quran.tj.quranapp"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'clamp(24px, 5vw, 32px)',
            textDecoration: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title="Боргирӣ аз Google Play"
        >
          <img
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            alt="Get it on Google Play"
            width={120}
            height={46}
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'contain',
              maxWidth: '120px',
            }}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </a>

        {/* Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          aria-label="Кушодани ҷустуҷӯ"
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
            flexShrink: 0,
          }}
        >
          <SearchIcon size={24} color="var(--color-text-primary)" />
        </button>

        {/* Navigation Button */}
        <button
          onClick={() => setIsNavigationOpen(true)}
          aria-label="Кушодани навигатсия"
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
            flexShrink: 0,
          }}
        >
          <NavigationIcon size={24} color="var(--color-text-primary)" />
        </button>

        {/* Info/Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Кушодани танзимот"
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
            flexShrink: 0,
          }}
        >
          <PaletteIcon size={24} color="var(--color-text-primary)" />
        </button>
      </header>

      {/* Magic Curve Sidebar - Always visible on desktop, toggleable on mobile */}
      <MagicCurveSidebar
        navItems={navItems}
        homeSections={homeSections}
        isOpen={isMobile ? isMenuOpen : true}
        onClose={() => setIsMenuOpen(false)}
      />

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

