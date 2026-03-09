'use client';

import { useState, useEffect } from 'react';
import { ImageData } from '@/lib/services/image-api-service';
import { throttle } from '@/lib/utils/throttle';

interface GalleryZardevorLayoutProps {
  images: ImageData[];
  onImageClick: (image: ImageData) => void;
  isLoadingMore?: boolean;
}

export default function GalleryZardevorLayout({
  images,
  onImageClick,
  isLoadingMore = false,
}: GalleryZardevorLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    // Throttle resize handler to reduce TBT (Phase 2, Section 3.3)
    const throttledCheckMobile = throttle(checkMobile, 150);
    window.addEventListener('resize', throttledCheckMobile, { passive: true });
    return () => window.removeEventListener('resize', throttledCheckMobile);
  }, []);

  if (images.length === 0) return null;

  // Group images into pages of 8
  const itemsPerPage = 8;
  const pages: ImageData[][] = [];
  for (let i = 0; i < images.length; i += itemsPerPage) {
    pages.push(images.slice(i, i + itemsPerPage));
  }

  const buildImageItem = (image: ImageData, height: number) => {
    const responsiveHeight = isMobile ? Math.min(height, 140) : height;
    
    return (
      <figure
        key={image.url}
        style={{
          margin: 0,
          position: 'relative',
          minHeight: `${responsiveHeight}px`,
          width: '100%',
          borderRadius: 'clamp(8px, 2vw, 16px)',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundColor: 'var(--color-surface-variant)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => onImageClick(image)}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
          }
        }}
      >
        <img
          src={image.url}
          alt={image.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
          loading="lazy"
        />
        {image.name.trim() ? (
          <figcaption
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              margin: 0,
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
              padding: '8px 10px',
              pointerEvents: 'none',
              color: '#fff',
              fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
              fontWeight: '600',
            }}
          >
            {image.name}
          </figcaption>
        ) : null}
      </figure>
    );
  };

  return (
    <section
      aria-label="Зардеворҳои исломӣ"
      style={{
        padding: 'clamp(8px, 2vw, 16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(8px, 2vw, 16px)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {pages.map((pageImages, pageIndex) => (
        <div key={pageIndex} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 16px)' }}>
          {/* Top Block: 1 Big Left, 2 Small Right - responsive */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: 'clamp(8px, 2vw, 16px)',
          }}>
            {pageImages[0] && buildImageItem(pageImages[0], isMobile ? 140 : 180)}
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 16px)' }}>
                {pageImages[1] && buildImageItem(pageImages[1], 85)}
                {pageImages[2] && buildImageItem(pageImages[2], 85)}
              </div>
            )}
            {isMobile && (
              <>
                {pageImages[1] && buildImageItem(pageImages[1], 120)}
                {pageImages[2] && buildImageItem(pageImages[2], 120)}
              </>
            )}
          </div>

          {/* Middle Block: 3 Equal Squares - responsive */}
          {pageImages.length > 3 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 'clamp(8px, 2vw, 16px)',
            }}>
              {pageImages[3] && buildImageItem(pageImages[3], isMobile ? 120 : 110)}
              {pageImages[4] && buildImageItem(pageImages[4], isMobile ? 120 : 110)}
              {pageImages[5] && buildImageItem(pageImages[5], isMobile ? 120 : 110)}
            </div>
          )}

          {/* Bottom Block: 2 Small Left, 1 Big Right - responsive */}
          {pageImages.length > 6 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
              gap: 'clamp(8px, 2vw, 16px)',
            }}>
              {!isMobile && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 16px)' }}>
                    {pageImages[6] && buildImageItem(pageImages[6], 85)}
                    {pageImages[7] && buildImageItem(pageImages[7], 85)}
                  </div>
                  {pageImages[8] ? buildImageItem(pageImages[8], 180) : pageImages[0] && buildImageItem(pageImages[0], 180)}
                </>
              )}
              {isMobile && (
                <>
                  {pageImages[6] && buildImageItem(pageImages[6], 120)}
                  {pageImages[7] && buildImageItem(pageImages[7], 120)}
                  {pageImages[8] && buildImageItem(pageImages[8], 140)}
                </>
              )}
            </div>
          )}
        </div>
      ))}
      {isLoadingMore && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '24px',
          color: 'var(--color-text-secondary)',
        }}>
          Боргирӣ карда истодааст...
        </div>
      )}
    </section>
  );
}
