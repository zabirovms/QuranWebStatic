'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ImageApiService, ImageData } from '@/lib/services/image-api-service';
import GalleryLayoutSwitcher, { GalleryLayout } from '@/components/gallery/GalleryLayoutSwitcher';
import StandardGalleryLayout from '@/components/gallery/StandardGalleryLayout';
import StandardImageViewer from '@/components/StandardImageViewer';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { useSidebarHover } from '@/components/MagicCurveSidebar';

interface GalleryPageClientProps {
  initialPictures: ImageData[];
  initialWallpapers: ImageData[];
}

/**
 * Client component for gallery interactivity
 * Receives pre-rendered images from server component
 */
export default function GalleryPageClient({ 
  initialPictures, 
  initialWallpapers 
}: GalleryPageClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const isSidebarHovered = useSidebarHover();
  // Default to true (mobile) to prevent content shift on initial render
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return true; // Default to mobile on SSR to prevent flash/shift
  });
  const [images, setImages] = useState<ImageData[]>(initialPictures);
  const [wallpaperImages, setWallpaperImages] = useState<ImageData[]>(initialWallpapers);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [activeLayout, setActiveLayout] = useState<GalleryLayout>(GalleryLayout.WITH_TEXT);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [nextWallpapersPageToken, setNextWallpapersPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreWallpapers, setHasMoreWallpapers] = useState(true);
  const [isNetworkError, setIsNetworkError] = useState(false);

  const imageApiService = useMemo(() => new ImageApiService(), []);
  const hasLoadedRef = useRef(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadImages = useCallback(async () => {
    if (isLoading || isLoadingMore) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNetworkError(false);
    setImages([]);

    try {
      const result = await imageApiService.fetchImageData({
        prefix: 'pictures/',
        pageSize: 40,
      });

      if (result.images.length === 0) {
        setError('Тасвирҳо ёфт нашуд. Лутфан пас аз чанд лаҳза навсозӣ кунед.');
        setImages([]);
        setIsLoading(false);
        return;
      }

      const shuffledImages = shuffleArray(result.images);
      setImages(shuffledImages);
      setNextPageToken(result.nextPageToken);
      setHasMore(result.nextPageToken !== null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Хатоги дар боргирии тасвирҳо';
      setError(errorMessage);
      setIsNetworkError(
        errorMessage.includes('Network') || 
        errorMessage.includes('internet connection') ||
        errorMessage.includes('timeout')
      );
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [imageApiService, isLoading, isLoadingMore]);

  const loadWallpapers = useCallback(async () => {
    if (isLoading || isLoadingMore) {
      return;
    }

    if (wallpaperImages.length > 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNetworkError(false);

    try {
      const result = await imageApiService.fetchImageData({
        prefix: 'wallpapers/',
        pageSize: 40,
      });

      if (result.images.length === 0) {
        setError('Зардеворҳо ёфт нашуд. Лутфан пас аз чанд лаҳза навсозӣ кунед.');
        setWallpaperImages([]);
        setIsLoading(false);
        return;
      }

      const shuffledImages = shuffleArray(result.images);
      setWallpaperImages(shuffledImages);
      setNextWallpapersPageToken(result.nextPageToken);
      setHasMoreWallpapers(result.nextPageToken !== null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Хатоги дар боргирии зардеворҳо';
      setError(errorMessage);
      setIsNetworkError(
        errorMessage.includes('Network') || 
        errorMessage.includes('internet connection') ||
        errorMessage.includes('timeout')
      );
      setWallpaperImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [imageApiService, isLoading, isLoadingMore, wallpaperImages.length]);

  const loadMoreImages = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextPageToken) return;

    setIsLoadingMore(true);
    try {
      const result = await imageApiService.fetchImageData({
        prefix: 'pictures/',
        pageToken: nextPageToken,
        pageSize: 40,
      });

      const shuffledImages = shuffleArray(result.images);
      setImages((prev) => [...prev, ...shuffledImages]);
      setNextPageToken(result.nextPageToken);
      setHasMore(result.nextPageToken !== null);
    } catch (err) {
      console.error('Error loading more images:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [imageApiService, hasMore, isLoadingMore, nextPageToken]);

  const loadMoreWallpapers = useCallback(async () => {
    if (!hasMoreWallpapers || isLoadingMore || !nextWallpapersPageToken) return;

    setIsLoadingMore(true);
    try {
      const result = await imageApiService.fetchImageData({
        prefix: 'wallpapers/',
        pageToken: nextWallpapersPageToken,
        pageSize: 40,
      });

      const shuffledImages = shuffleArray(result.images);
      setWallpaperImages((prev) => [...prev, ...shuffledImages]);
      setNextWallpapersPageToken(result.nextPageToken);
      setHasMoreWallpapers(result.nextPageToken !== null);
    } catch (err) {
      console.error('Error loading more wallpapers:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [imageApiService, hasMoreWallpapers, isLoadingMore, nextWallpapersPageToken]);

  useEffect(() => {
    if (activeLayout === GalleryLayout.ZARDEVOR && wallpaperImages.length === 0 && initialWallpapers.length === 0) {
      loadWallpapers();
    }
  }, [activeLayout, wallpaperImages.length, initialWallpapers.length, loadWallpapers]);

  // Throttled scroll handler for infinite scroll
  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && 
              window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 200) {
            if (activeLayout === GalleryLayout.ZARDEVOR) {
              loadMoreWallpapers();
            } else {
              loadMoreImages();
            }
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeLayout, loadMoreImages, loadMoreWallpapers]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLayoutChange = (layout: GalleryLayout) => {
    setActiveLayout(layout);
    if (layout === GalleryLayout.ZARDEVOR && wallpaperImages.length === 0 && initialWallpapers.length === 0) {
      loadWallpapers();
    }
  };

  const handleRetry = () => {
    if (activeLayout === GalleryLayout.ZARDEVOR) {
      setWallpaperImages([]);
      loadWallpapers();
    } else {
      loadImages();
    }
  };

  // Memoize current images to prevent unnecessary re-renders
  const currentImages = useMemo(() => 
    activeLayout === GalleryLayout.ZARDEVOR ? wallpaperImages : images,
    [activeLayout, wallpaperImages, images]
  );
  const currentHasMore = activeLayout === GalleryLayout.ZARDEVOR ? hasMoreWallpapers : hasMore;

  // Sync browser back/forward buttons with modal open state
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.galleryModal) {
        // If there's modal state, try to find the matching image and reopen it
        const pathParts = window.location.pathname.split('/');
        const slug = pathParts[pathParts.length - 1];
        const match = currentImages.find(img => img.slug === slug);
        if (match) {
          setSelectedImage(match);
        } else {
          setSelectedImage(null);
        }
      } else {
        setSelectedImage(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentImages]);

  // Memoize image click handler
  const handleImageClick = useCallback((image: ImageData, index: number) => {
    setSelectedImage(image);
    // Push slug to browser address bar without reload
    window.history.pushState({ galleryModal: true }, '', `/gallery/${image.slug}`);
  }, []);

  // Memoize close handler
  const handleCloseViewer = useCallback(() => {
    setSelectedImage(null);
    // Restore the URL to main gallery page
    window.history.pushState(null, '', '/gallery');
  }, []);

  // Memoize image change handler
  const handleImageChange = useCallback((image: ImageData) => {
    setSelectedImage(image);
    // Update slug in address bar on next/previous image toggle
    window.history.replaceState({ galleryModal: true }, '', `/gallery/${image.slug}`);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Layout Switcher */}
      <div 
        className="app-bar"
        style={{
          position: 'fixed',
          top: isTopBarVisible ? '56px' : '0',
          left: isMobile ? 0 : (isSidebarHovered ? '280px' : '64px'),
          right: 0,
          zIndex: 1019,
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-outline)',
          transition: 'top 0.3s ease-in-out, left 0.5s ease',
        }}
      >
        <GalleryLayoutSwitcher
          activeLayout={activeLayout}
          onLayoutChange={handleLayoutChange}
        />
      </div>

      {/* Content */}
      <main style={{
        flex: 1,
        paddingTop: isTopBarVisible ? '112px' : '56px',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        transition: 'padding-top 0.3s ease-in-out',
      }}>
        {/* Loading State - only show if no initial images */}
        {isLoading && currentImages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: 'var(--color-text-secondary)',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid var(--color-outline)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <div style={{ fontSize: '0.875rem' }}>Боргирӣ карда истодааст...</div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={{
            padding: '24px',
            margin: '16px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '16px',
            border: '1px solid var(--color-outline)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '1rem',
              color: 'var(--color-error)',
              marginBottom: '16px',
              whiteSpace: 'pre-line',
            }}>
              {error}
            </div>
            <button
              onClick={handleRetry}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Навсозӣ
            </button>
          </div>
        )}

        {/* Empty State - only show if no error and no images */}
        {!isLoading && !error && currentImages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '24px',
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
            <div style={{ fontSize: '1rem', marginBottom: '8px' }}>
              Тасвирҳо ёфт нашуд
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Лутфан пас аз чанд лаҳза навсозӣ кунед
            </div>
          </div>
        )}

        {/* Gallery Content */}
        {currentImages.length > 0 && (
          <StandardGalleryLayout
            images={currentImages}
            onImageClick={handleImageClick}
            isLoadingMore={isLoadingMore}
          />
        )}
      </main>

      {/* Standard Image Viewer */}
      {selectedImage && (
        <StandardImageViewer
          image={selectedImage}
          allImages={currentImages}
          onClose={handleCloseViewer}
          onImageChange={handleImageChange}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
