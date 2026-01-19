'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MagicCurveSidebar.module.css';
import LocalIcon from './LocalIcon';

// Global state for sidebar hover
let sidebarHoverState = false;
const hoverListeners = new Set<(hovered: boolean) => void>();

export function useSidebarHover() {
  const [isHovered, setIsHovered] = useState(sidebarHoverState);

  useEffect(() => {
    const listener = (hovered: boolean) => setIsHovered(hovered);
    hoverListeners.add(listener);
    return () => {
      hoverListeners.delete(listener);
    };
  }, []);

  return isHovered;
}

function setSidebarHover(hovered: boolean) {
  sidebarHoverState = hovered;
  hoverListeners.forEach(listener => listener(hovered));
}

interface NavItem {
  href: string;
  label: string;
  icon: string; // Ionicons name (e.g., "home", "book", "mosque")
  id: string;
  external?: boolean;
}

interface MagicCurveSidebarProps {
  navItems: NavItem[];
  homeSections?: NavItem[];
  isOpen?: boolean; // Optional, sidebar is always visible now
  onClose?: () => void; // Optional
}

export default function MagicCurveSidebar({ 
  navItems, 
  homeSections = [],
  isOpen = true, // Always visible by default on desktop, toggleable on mobile
  onClose 
}: MagicCurveSidebarProps) {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>('');
  // Initialize isMobile based on window width immediately to prevent flash
  // Default to true (mobile) to ensure sidebar is hidden on first render
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    // Default to true (mobile) on SSR to prevent flash
    return true;
  });

  // On mobile, ensure sidebar is closed by default to prevent flash
  // Only open if explicitly set to true (when user clicks hamburger)
  // On desktop, always open
  const effectiveIsOpen = isMobile ? (isOpen === true) : true;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Determine active item based on pathname
    if (!pathname) {
      setActiveId('home');
      return;
    }

    // Check main nav items
    const activeNavItem = navItems.find(item => {
      if (item.href === '/') {
        return pathname === '/';
      }
      return pathname === item.href || pathname.startsWith(item.href + '/');
    });

    if (activeNavItem) {
      setActiveId(activeNavItem.id);
      return;
    }

    // Check home sections
    const activeSection = homeSections.find(section => {
      if (section.href.startsWith('http')) return false;
      if (section.href.startsWith('#')) return false;
      return pathname === section.href || pathname.startsWith(section.href + '/');
    });

    if (activeSection) {
      setActiveId(activeSection.id);
      return;
    }

    setActiveId('');
  }, [pathname, navItems, homeSections]);

  const handleItemClick = (id: string) => {
    setActiveId(id);
    // On mobile, close sidebar after clicking a link
    if (isMobile && onClose) {
      onClose();
    }
  };

  const allItems = [...navItems, ...homeSections];

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && effectiveIsOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2019,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <nav
        className={`${styles.magicCurveSidebar} ${
          isMobile 
            ? (effectiveIsOpen ? styles.mobileOpen : styles.mobileHidden)
            : ''
        }`}
        style={isMobile && !effectiveIsOpen ? {
          left: '-280px',
          width: '280px',
        } : undefined}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          if (!isMobile) {
            setSidebarHover(true);
          }
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            setSidebarHover(false);
          }
        }}
      >
        <ul>
          {allItems.map((item) => {
            const isActive = activeId === item.id;
            const isExternal = item.external === true;

            const linkContent = (
              <>
                <span className={styles.icon}>
                  <LocalIcon name={item.icon} />
                </span>
                <span className={styles.title}>
                  {item.label}
                </span>
              </>
            );

            if (isExternal) {
              return (
                <li
                  key={item.id}
                  className={isActive ? styles.active : ''}
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleItemClick(item.id)}
                  >
                    {linkContent}
                  </a>
                </li>
              );
            }

            // Handle hash links (like #live-streams)
            if (item.href.startsWith('#')) {
              return (
                <li
                  key={item.id}
                  className={isActive ? styles.active : ''}
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.querySelector(item.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                      handleItemClick(item.id);
                    }}
                  >
                    {linkContent}
                  </a>
                </li>
              );
            }

            return (
              <li
                key={item.id}
                className={isActive ? styles.active : ''}
              >
                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={() => handleItemClick(item.id)}
                >
                  {linkContent}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
