'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GalleryImage } from '@/lib/types';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
}

export default function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  if (images.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem',
      }}>
        Тасвирҳо нест
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
      padding: '16px',
    }}>
      {images.map((image) => (
        <div
          key={image.id}
          onClick={() => onImageClick(image)}
          style={{
            position: 'relative',
            aspectRatio: '1',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            backgroundColor: 'var(--color-surface-variant)',
            border: '1px solid var(--color-outline)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {!loadedImages.has(image.id) && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
            }}>
              <div style={{ color: '#999', fontSize: '0.875rem' }}>Боргирӣ...</div>
            </div>
          )}
          <Image
            src={image.thumbnailUrl || image.url}
            alt={image.name}
            fill
            style={{
              objectFit: 'cover',
              opacity: loadedImages.has(image.id) ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
            onLoad={() => handleImageLoad(image.id)}
            unoptimized
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            padding: '8px',
            color: 'var(--color-on-surface)',
            fontSize: '0.75rem',
            fontWeight: '500',
          }}>
            {image.name}
          </div>
        </div>
      ))}
    </div>
  );
}

