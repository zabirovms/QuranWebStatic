'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface TopBarContextType {
  isVisible: boolean;
}

const TopBarContext = createContext<TopBarContextType>({ isVisible: true });

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Show TopBar when at top of page
          if (currentScrollY <= 10) {
            setIsVisible(true);
          } else {
            // Hide when scrolling down, show when scrolling up
            setIsVisible(currentScrollY < lastScrollY.current);
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <TopBarContext.Provider value={{ isVisible }}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  return useContext(TopBarContext);
}

