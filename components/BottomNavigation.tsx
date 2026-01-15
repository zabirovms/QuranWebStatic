'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();

  const getActiveIndex = () => {
    if (!pathname) return 2; // Default to Main Menu (center)
    if (pathname === '/audio-home' || pathname.startsWith('/audio-home/')) {
      return 0; // Audio
    }
    if (pathname === '/quran' || pathname.startsWith('/surah/')) {
      return 1; // Quran
    }
    if (pathname === '/') {
      return 2; // Main Menu (center)
    }
    if (pathname === '/learn-words') {
      return 3; // Learn Words
    }
    if (pathname === '/settings') {
      return 4; // Settings
    }
    return 2; // Default to Main Menu
  };

  const activeIndex = getActiveIndex();
  const activeIconColor = 'var(--color-primary)';
  const inactiveIconColor = 'var(--color-text-secondary)';

  const navItems = [
    { href: '/audio-home', label: 'Қироат', icon: '🎵', id: 'audio' },
    { href: '/quran', label: 'Қуръон', icon: '📖', id: 'quran' },
    { href: '/', label: 'Асосӣ', icon: '🏠', id: 'home' },
    { href: '/learn-words', label: 'Омӯзиш', icon: '📚', id: 'learn' },
    { href: '/settings', label: 'Танзимот', icon: '⚙️', id: 'settings' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-outline)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        padding: '0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '60px',
        zIndex: 1000,
        boxShadow: 'var(--elevation-2)',
      }}
    >
      {navItems.map((item, index) => {
        const active = index === activeIndex;
        const isHome = item.id === 'home';
        const iconColor = active ? activeIconColor : inactiveIconColor;
        
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: iconColor,
              position: 'relative',
              flex: isHome ? '0 0 auto' : '1',
              ...(isHome && {
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface)',
                marginTop: '-20px',
                boxShadow: 'var(--elevation-4)',
                border: `2px solid var(--color-surface)`,
              }),
            }}
          >
            <span
              style={{
                fontSize: isHome ? '24px' : '24px',
                marginBottom: isHome ? '0' : '2px',
                display: 'block',
              }}
            >
              {item.icon}
            </span>
            {!isHome && (
              <span style={{ 
                fontSize: '10px', 
                fontWeight: active ? '500' : 'normal',
                fontFamily: 'inherit',
              }}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

