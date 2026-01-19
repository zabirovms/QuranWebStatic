'use client';

import { useSidebarHover } from './MagicCurveSidebar';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { useEffect, useState } from 'react';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const isSidebarHovered = useSidebarHover();
  const { isVisible: isTopBarVisible } = useTopBar();
  // Default to true (mobile) to prevent content shift on initial render
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return true; // Default to mobile on SSR to prevent flash/shift
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main 
      style={{ 
        marginTop: isTopBarVisible ? '56px' : '0', 
        marginLeft: isMobile ? 0 : (isSidebarHovered ? '280px' : '64px'), 
        flex: 1, 
        paddingTop: 0, 
        transition: 'margin-top 0.4s ease-out, margin-left 0.5s ease' 
      }}
    >
      {children}
    </main>
  );
}
