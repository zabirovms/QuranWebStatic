'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { GalleryImage } from '@/lib/types';

interface ImageViewerProps {
  image: GalleryImage | null;
  onClose: () => void;
}

// Helper to convert ImageData to GalleryImage if needed
export function imageDataToGalleryImage(image: { url: string; name: string }): GalleryImage {
  return {
    id: image.url,
    url: image.url,
    thumbnailUrl: image.url,
    name: image.name,
  };
}

export default function ImageViewer({ image, onClose }: ImageViewerProps) {
  useEffect(() => {
    if (image) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [image]);

  if (!image) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-40px',
            right: 0,
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          ×
        </button>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '90vw',
          maxHeight: '80vh',
          marginBottom: '16px',
        }}>
          <Image
            src={image.url}
            alt={image.name}
            width={1200}
            height={800}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
            unoptimized
          />
        </div>
        <div style={{
          color: '#fff',
          textAlign: 'center',
          padding: '0 20px',
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
          }}>
            {image.name}
          </h3>
          {image.category && (
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
            }}>
              {image.category}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

