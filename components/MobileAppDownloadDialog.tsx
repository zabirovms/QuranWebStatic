'use client';

import { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.quran.tj.quranapp';
const SESSION_STORAGE_KEY = 'mobile_app_dialog_dismissed_session';

// Detect if user is on mobile device
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if user is on Android
const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

export default function MobileAppDownloadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type
    setIsMobile(isMobileDevice());
    setIsAndroid(isAndroidDevice());
  }, []);

  useEffect(() => {
    // Check if user has dismissed the dialog in this session only
    const dismissedThisSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (dismissedThisSession === 'true') {
      return; // Don't show if dismissed in this session
    }

    // Smart detection: Show more prominently on mobile devices
    // On mobile devices, show faster (1 second) and more prominently
    // On Android, show even faster (0.5 seconds)
    const delay = isAndroid ? 500 : isMobile ? 1000 : 3000;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isMobile, isAndroid]);

  const handleClose = () => {
    setIsOpen(false);
    // Remember dismissal only for this session
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  };

  const handleDownload = () => {
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: isMobile ? '16px' : '20px',
          padding: isMobile ? '16px' : '24px',
          maxWidth: isMobile ? '90%' : '400px',
          width: '100%',
          maxHeight: isMobile ? '85vh' : 'none',
          overflowY: isMobile ? 'auto' : 'visible',
          boxShadow: isMobile ? 'var(--elevation-6)' : 'var(--elevation-4)',
          border: isAndroid ? '2px solid var(--color-primary)' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: isMobile ? '8px' : '16px',
            right: isMobile ? '8px' : '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <CloseIcon size={isMobile ? 20 : 24} color="var(--color-text-secondary)" />
        </button>

        {/* Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: isMobile ? '12px' : '20px',
        }}>
          <div style={{
            width: isMobile ? '100px' : '120px',
            height: isMobile ? '38px' : '45px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img 
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.style.width = isMobile ? '60px' : '80px';
                  parent.style.height = isMobile ? '60px' : '80px';
                  parent.style.borderRadius = '20px';
                  parent.style.backgroundColor = 'var(--color-primary-container)';
                  parent.innerHTML = `<span style="font-size: ${isMobile ? '36px' : '48px'};">📱</span>`;
                }
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: isMobile ? 'var(--font-size-lg)' : 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center',
          marginBottom: isMobile ? '8px' : '12px',
          color: 'var(--color-text-primary)',
        }}>
          {isAndroid ? 'Барномаи мобилӣ барои Android' : 'Барномаи мобилӣ'}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-md)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          lineHeight: '1.6',
          marginBottom: isMobile ? '16px' : '24px',
        }}>
          {isAndroid 
            ? 'Барномаи мобилии моро барои Android боргирӣ кунед ва Қуръони Каримро дар ҳар ҷо бо худ дошта бошед. Имкониятҳои бештар, интерфейси беҳтар ва истифодаи осонтар!'
            : isMobile
            ? 'Барномаи мобилии моро боргирӣ кунед ва Қуръони Каримро дар ҳар ҷо бо худ дошта бошед. Имкониятҳои бештар, интерфейси беҳтар ва истифодаи осонтар!'
            : 'Барномаи мобилии моро барои Android боргирӣ кунед ва Қуръони Каримро дар ҳар ҷо бо худ дошта бошед. Имкониятҳои бештар, интерфейси беҳтар ва истифодаи осонтар!'
          }
        </p>

        {/* Features */}
        <div style={{
          marginBottom: isMobile ? '16px' : '24px',
          padding: isMobile ? '12px' : '16px',
          backgroundColor: 'var(--color-surface-variant)',
          borderRadius: '12px',
        }}>
          <div style={{
            fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
            color: 'var(--color-text-primary)',
            lineHeight: '1.8',
          }}>
            ✨ Имкониятҳои бештар<br/>
            📱 Истифодаи осонтар<br/>
            🔔 Огоҳиномаҳои намоз<br/>
            💾 Хондани офлайн
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <button
            onClick={handleDownload}
            style={{
              width: '100%',
              padding: isMobile ? '12px' : '14px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: isMobile ? 'var(--font-size-sm)' : 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--elevation-2)',
            }}
          >
            <span>📥</span>
            <span>Боргирӣ аз Play Store</span>
          </button>
          <button
            onClick={handleClose}
            style={{
              width: '100%',
              padding: isMobile ? '10px' : '12px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
              cursor: 'pointer',
            }}
          >
            Баъдтар
          </button>
        </div>
      </div>
    </div>
  );
}
