'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MenuIcon, CloseIcon } from './Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import BukhariSidebar from './BukhariSidebar';
import BukhariSearch from './BukhariSearch';

interface BukhariTopBarProps {
  currentBookNumber?: number;
  currentSubNumber?: number | null;
  currentChapterNumber?: number;
}

export default function BukhariTopBar({
  currentBookNumber,
  currentSubNumber,
  currentChapterNumber,
}: BukhariTopBarProps) {
  const pathname = usePathname();
  const { isVisible } = useTopBar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Bukhari Top Bar */}
      <header
        style={{
          position: 'fixed',
          top: isVisible ? '56px' : '0px',
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: 'var(--color-primary)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(12px, 3vw, 16px)',
          gap: 'clamp(8px, 2vw, 12px)',
          zIndex: 999,
          transition: 'top 0.4s ease-out',
        }}
      >
        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onMouseEnter={() => {
            if (!isMobile) {
              setIsMenuOpen(true);
            }
          }}
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
          title="Меню"
        >
          {isMenuOpen ? (
            <CloseIcon size={24} color="white" />
          ) : (
            <MenuIcon size={24} color="white" />
          )}
        </button>

        {/* Title Link */}
        <Link
          href="/bukhari"
          style={{
            fontSize: 'clamp(14px, 3vw, var(--font-size-lg))',
            fontWeight: 600,
            color: 'white',
            textDecoration: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Саҳеҳи Бухорӣ
        </Link>

        {/* Search - Centered */}
        <div style={{
          flex: 1,
          maxWidth: '600px',
          minWidth: 0,
        }}>
          <BukhariSearch />
        </div>
      </header>

      {/* Sidebar */}
      <BukhariSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentBookNumber={currentBookNumber}
        currentSubNumber={currentSubNumber}
        currentChapterNumber={currentChapterNumber}
        isCompact={true}
      />
    </>
  );
}
