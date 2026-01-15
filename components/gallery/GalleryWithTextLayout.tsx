'use client';

import { useState, useEffect } from 'react';
import { ImageData } from '@/lib/services/image-api-service';

interface GalleryWithTextLayoutProps {
  images: ImageData[];
  onImageClick: (image: ImageData) => void;
  isLoadingMore?: boolean;
}

export default function GalleryWithTextLayout({
  images,
  onImageClick,
  isLoadingMore = false,
}: GalleryWithTextLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (images.length === 0) return null;

  // Group images into pages of 7
  const itemsPerPage = 7;
  const pages: ImageData[][] = [];
  for (let i = 0; i < images.length; i += itemsPerPage) {
    pages.push(images.slice(i, i + itemsPerPage));
  }

  const buildImageItem = (image: ImageData, height: number, showName = true) => {
    const responsiveHeight = isMobile ? Math.min(height, 140) : height;
    
    return (
      <div
        key={image.url}
        onClick={() => onImageClick(image)}
        style={{
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
        {showName && image.name.trim() && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
            padding: '12px',
            pointerEvents: 'none',
          }}>
            <div style={{
              color: '#fff',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              fontWeight: '600',
            }}>
              {image.name}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      padding: 'clamp(8px, 2vw, 16px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(8px, 2vw, 16px)',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      {pages.map((pageImages, pageIndex) => (
        <div key={pageIndex} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 16px)' }}>
          {/* Top Row: 2 columns - responsive */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 'clamp(8px, 2vw, 16px)',
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)' }}>
              {pageImages[0] && buildImageItem(pageImages[0], isMobile ? 100 : 120)}
              {pageImages[1] && buildImageItem(pageImages[1], isMobile ? 100 : 120)}
            </div>
            {/* Right Column */}
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vw, 12px)' }}>
                {pageImages[2] && buildImageItem(pageImages[2], 150)}
                {pageImages[3] && buildImageItem(pageImages[3], 80)}
              </div>
            )}
            {isMobile && (
              <>
                {pageImages[2] && buildImageItem(pageImages[2], 120)}
                {pageImages[3] && buildImageItem(pageImages[3], 100)}
              </>
            )}
          </div>

          {/* Full Width */}
          {pageImages[4] && buildImageItem(pageImages[4], isMobile ? 120 : 140)}

          {/* Bottom Row: 2 columns */}
          {pageImages.length > 5 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 'clamp(8px, 2vw, 12px)',
            }}>
              {pageImages[5] && buildImageItem(pageImages[5], isMobile ? 100 : 120)}
              {pageImages[6] && buildImageItem(pageImages[6], isMobile ? 100 : 120)}
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
    </div>
  );
}
