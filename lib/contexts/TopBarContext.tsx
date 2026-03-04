'use client';

import { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';

interface TopBarContextType {
  isVisible: boolean;
}

const TopBarContext = createContext<TopBarContextType>({ isVisible: true });

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const currentVisibleRef = useRef(true);

  useEffect(() => {
    const SCROLL_THRESHOLD = 100; // Hide navbar after scrolling down 100px (like quran.com)
    const SCROLL_UP_THRESHOLD = 5; // Show navbar when scrolling up by at least 5px

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY.current;

          let nextVisible: boolean;
          if (currentScrollY <= 10) {
            nextVisible = true;
          } else if (scrollDelta > 0 && currentScrollY > SCROLL_THRESHOLD) {
            nextVisible = false;
          } else if (scrollDelta < -SCROLL_UP_THRESHOLD) {
            nextVisible = true;
          } else {
            nextVisible = currentVisibleRef.current;
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;

          if (nextVisible !== currentVisibleRef.current) {
            currentVisibleRef.current = nextVisible;
            setIsVisible(nextVisible);
          }
        });

        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const value = useMemo(() => ({ isVisible }), [isVisible]);

  return (
    <TopBarContext.Provider value={value}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  return useContext(TopBarContext);
}

