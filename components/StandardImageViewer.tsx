'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { ImageData } from '@/lib/services/image-api-service';

interface StandardImageViewerProps {
  image: ImageData;
  allImages: ImageData[];
  onClose: () => void;
  onImageChange: (image: ImageData) => void;
}

function StandardImageViewer({
  image,
  allImages,
  onClose,
  onImageChange,
}: StandardImageViewerProps) {
  // Memoize initial index calculation
  const initialIndex = useMemo(() => 
    allImages.findIndex(img => img.url === image.url),
    [image.url, allImages]
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [thumbnailColumns, setThumbnailColumns] = useState(6);
  const [isMobile, setIsMobile] = useState(false);

  const currentImage = useMemo(() => 
    allImages[currentImageIndex] || image,
    [allImages, currentImageIndex, image]
  );

  // Throttle resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateColumns = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      let newColumns = 6;
      if (width < 640) {
        newColumns = 4;
      } else if (width < 1024) {
        newColumns = 5;
      } else if (width < 1440) {
        newColumns = 6;
      } else {
        newColumns = 8;
      }
      
      if (newColumns !== thumbnailColumns) {
        setThumbnailColumns(newColumns);
      }
    };

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 150);
    };

    updateColumns();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [thumbnailColumns]);

  // Update index when image prop changes
  useEffect(() => {
    const index = allImages.findIndex(img => img.url === image.url);
    if (index !== -1 && index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  }, [image.url, allImages, currentImageIndex]);

  const handlePrevious = useCallback(() => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      onImageChange(allImages[newIndex]);
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        const thumbnail = document.querySelector(`[data-thumbnail-index="${newIndex}"]`);
        thumbnail?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    }
  }, [currentImageIndex, allImages, onImageChange]);

  const handleNext = useCallback(() => {
    if (currentImageIndex < allImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      onImageChange(allImages[newIndex]);
      requestAnimationFrame(() => {
        const thumbnail = document.querySelector(`[data-thumbnail-index="${newIndex}"]`);
        thumbnail?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    }
  }, [currentImageIndex, allImages, onImageChange]);

  const handleThumbnailClick = useCallback((clickedImage: ImageData) => {
    const index = allImages.findIndex(img => img.url === clickedImage.url);
    if (index !== -1) {
      setCurrentImageIndex(index);
      onImageChange(clickedImage);
    }
  }, [allImages, onImageChange]);

  // Memoize keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && currentImageIndex < allImages.length - 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentImageIndex, allImages.length, onClose, handlePrevious, handleNext]);

  // Memoize thumbnail grid style
  const thumbnailGridStyle = useMemo(() => ({
    display: 'grid' as const,
    gridTemplateColumns: `repeat(${thumbnailColumns}, 1fr)`,
    gap: '8px',
  }), [thumbnailColumns]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001,
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        ×
      </button>

      {/* Large Image at Top */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px 20px',
          minHeight: 0,
          position: 'relative',
        }}
      >
        {/* Navigation Arrows */}
        {currentImageIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            style={{
              position: 'absolute',
              left: isMobile ? '10px' : '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease',
              zIndex: 2002,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ‹
          </button>
        )}
        
        {currentImageIndex < allImages.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            style={{
              position: 'absolute',
              right: isMobile ? '10px' : '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease',
              zIndex: 2002,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ›
          </button>
        )}

        <img
          src={currentImage.url}
          alt={currentImage.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Image Name */}
      {currentImage.name && (
        <div style={{
          color: '#fff',
          fontSize: '0.875rem',
          textAlign: 'center',
          padding: '0 20px 12px',
          flexShrink: 0,
        }}>
          {currentImage.name}
        </div>
      )}

      {/* Thumbnail Grid Below */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          padding: '0 20px 20px',
          flexShrink: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        className="scrollable-container"
      >
        <div style={thumbnailGridStyle}>
          {allImages.map((img, index) => (
            <ThumbnailItem
              key={img.url}
              img={img}
              index={index}
              isActive={index === currentImageIndex}
              onClick={handleThumbnailClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoized thumbnail item to prevent unnecessary re-renders
const ThumbnailItem = memo(({ 
  img, 
  index, 
  isActive, 
  onClick 
}: { 
  img: ImageData; 
  index: number; 
  isActive: boolean; 
  onClick: (image: ImageData) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onClick(img);
  }, [onClick, img]);

  const thumbnailStyle = useMemo(() => ({
    position: 'relative' as const,
    aspectRatio: '1',
    borderRadius: '4px',
    overflow: 'hidden' as const,
    cursor: 'pointer',
    border: isActive ? '2px solid #fff' : '2px solid transparent',
    opacity: isActive ? 1 : (isHovered ? 0.9 : 0.7),
    transition: 'opacity 0.2s ease, border-color 0.2s ease',
  }), [isActive, isHovered]);

  return (
    <div
      data-thumbnail-index={index}
      onClick={handleClick}
      style={thumbnailStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={img.url}
        alt={img.name}
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

ThumbnailItem.displayName = 'ThumbnailItem';

export default memo(StandardImageViewer);
