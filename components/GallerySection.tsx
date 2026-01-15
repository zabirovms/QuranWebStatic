'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ImageApiService, ImageData } from '@/lib/services/image-api-service';

export default function GallerySection() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const imageApiService = useMemo(() => new ImageApiService(), []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Loading gallery images...');
        const result = await imageApiService.fetchImageData({
          prefix: 'pictures/',
          pageSize: 6, // Load 6 images for preview
        });

        console.log('Gallery images loaded:', result.images.length);

        if (!isMounted) return;

        if (result.images.length > 0) {
          const shuffledImages = shuffleArray(result.images);
          setImages(shuffledImages.slice(0, 6)); // Show max 6 images
        } else {
          setError('Тасвирҳо ёфт нашуд');
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Хатоги дар боргирии тасвирҳо';
        setError(errorMessage);
        console.error('Error loading gallery images:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Delay loading slightly to prioritize other sections
    const timer = setTimeout(() => {
      loadImages();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageApiService]);

  if (isLoading) {
    return (
      <div style={{
        height: '310px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '3px solid var(--color-outline)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '310px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-error)',
        fontSize: '0.875rem',
        padding: '16px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '8px' }}>⚠️</div>
        <div>{error}</div>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            imageApiService.fetchImageData({
              prefix: 'pictures/',
              pageSize: 6,
            }).then((result) => {
              if (result.images.length > 0) {
                const shuffledImages = shuffleArray(result.images);
                setImages(shuffledImages.slice(0, 6));
              } else {
                setError('Тасвирҳо ёфт нашуд');
              }
            }).catch((err) => {
              setError(err instanceof Error ? err.message : 'Хатоги дар боргирии тасвирҳо');
            }).finally(() => {
              setIsLoading(false);
            });
          }}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Навсозӣ
        </button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{
        height: '310px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem',
      }}>
        Галерея дар шабака
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div 
        className="scrollable-container"
        style={{
          height: '310px',
          display: 'inline-flex',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '8px 12px',
          maxWidth: '100%',
        }}
      >
      {images.map((image, index) => (
        <Link
          key={index}
          href="/gallery"
          style={{
            position: 'relative',
            minWidth: '200px',
            maxWidth: '200px',
            height: '280px',
            borderRadius: '12px',
            overflow: 'hidden',
            textDecoration: 'none',
            flexShrink: 0,
            display: 'block',
          }}
        >
          <img
            src={image.url}
            alt={image.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            padding: '12px',
            color: '#fff',
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {image.name}
            </div>
          </div>
        </Link>
      ))}
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

