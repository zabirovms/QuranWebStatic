'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { ImageData } from '@/lib/services/image-api-service';

interface StandardGalleryLayoutProps {
  images: ImageData[];
  onImageClick: (image: ImageData, index: number) => void;
  isLoadingMore?: boolean;
}

function StandardGalleryLayout({
  images,
  onImageClick,
  isLoadingMore = false,
}: StandardGalleryLayoutProps) {
  const [columns, setColumns] = useState(4);

  // Throttle resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateColumns = () => {
      const width = window.innerWidth;
      let newColumns = 4;
      if (width < 640) {
        newColumns = 2;
      } else if (width < 1024) {
        newColumns = 3;
      } else if (width < 1440) {
        newColumns = 4;
      } else {
        newColumns = 5;
      }
      
      if (newColumns !== columns) {
        setColumns(newColumns);
      }
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 150); // Throttle to 150ms
    };

    updateColumns();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [columns]);

  // Memoize grid style
  const gridStyle = useMemo(() => ({
    display: 'grid' as const,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '8px',
  }), [columns]);

  // Memoize container style
  const containerStyle = useMemo(() => ({
    padding: '12px',
    maxWidth: '1600px',
    margin: '0 auto',
  }), []);

  // Memoize click handler
  const handleImageClick = useCallback((image: ImageData, index: number) => {
    onImageClick(image, index);
  }, [onImageClick]);

  if (images.length === 0) return null;

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {images.map((image, index) => (
          <ImageThumbnail
            key={image.url}
            image={image}
            index={index}
            onClick={handleImageClick}
          />
        ))}
      </div>
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

// Memoized thumbnail component to prevent unnecessary re-renders
const ImageThumbnail = memo(({ 
  image, 
  index, 
  onClick 
}: { 
  image: ImageData; 
  index: number; 
  onClick: (image: ImageData, index: number) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onClick(image, index);
  }, [onClick, image, index]);

  const thumbnailStyle = useMemo(() => ({
    position: 'relative' as const,
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden' as const,
    cursor: 'pointer',
    backgroundColor: 'var(--color-surface-variant)',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }), [isHovered]);

  return (
    <div
      onClick={handleClick}
      style={thumbnailStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={image.url}
        alt={image.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
});

ImageThumbnail.displayName = 'ImageThumbnail';

export default memo(StandardGalleryLayout);
