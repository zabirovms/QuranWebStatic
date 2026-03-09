'use client';

import { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.quran.tj.quranapp';
const BANNER_STORAGE_KEY = 'mobile_app_banner_dismissed';

export default function MobileAppBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
    if (dismissed) {
      // Check if it was dismissed more than 30 days ago (show again after a month)
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 30) {
        return;
      }
    }

    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Remember dismissal for 30 days
    localStorage.setItem(BANNER_STORAGE_KEY, new Date().toISOString());
  };

  const handleDownload = () => {
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div
      data-nosnippet
      style={{
        position: 'relative',
        marginBottom: '16px',
        padding: '16px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-outline)',
        borderLeft: '4px solid var(--color-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--elevation-2)',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CloseIcon size={18} color="var(--color-text-secondary)" />
      </button>

      {/* Icon at top */}
      <div style={{
        width: '120px',
        height: '45px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img 
          src="/google-play-badge.png"
          alt="Get it on Google Play"
          width={120}
          height={46}
          loading="lazy"
          sizes="120px"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback === 'done') return;
            img.dataset.fallback = 'done';
            img.src = 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png';
          }}
        />
      </div>

      {/* Content – surface background ensures text-primary/secondary have proper contrast */}
      <div style={{ 
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          Барномаи мобилӣ
        </div>
        <div 
          data-nosnippet
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.4',
            marginBottom: '12px',
          }}
        >
          Барномаи мобилии моро боргирӣ кунед ва имкониятҳои бештарро истифода баред
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        style={{
          width: '100%',
          padding: '10px 16px',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
          borderRadius: '8px',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          cursor: 'pointer',
          boxShadow: 'var(--elevation-1)',
        }}
      >
        Боргирӣ аз Play Store
      </button>
    </div>
  );
}
