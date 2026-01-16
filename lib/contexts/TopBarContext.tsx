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
    const SCROLL_THRESHOLD = 100; // Hide navbar after scrolling down 100px (like quran.com)
    const SCROLL_UP_THRESHOLD = 5; // Show navbar when scrolling up by at least 5px
    
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY.current;
          
          // Show TopBar when at top of page
          if (currentScrollY <= 10) {
            setIsVisible(true);
          } else {
            // Only hide if scrolled down past threshold
            if (scrollDelta > 0 && currentScrollY > SCROLL_THRESHOLD) {
              setIsVisible(false);
            } 
            // Show when scrolling up (with small threshold to avoid flickering)
            else if (scrollDelta < -SCROLL_UP_THRESHOLD) {
              setIsVisible(true);
            }
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

