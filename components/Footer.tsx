'use client';

import { useState } from 'react';
import Link from 'next/link';
import LocalIcon from './LocalIcon';


export default function Footer() {
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showShareRateDialog, setShowShareRateDialog] = useState(false);

  return (
    <>
      <footer 
        data-nosnippet
        style={{
          backgroundColor: 'var(--color-surface-variant)',
          borderTop: '1px solid var(--color-outline)',
          padding: 'var(--spacing-2xl) var(--spacing-lg)',
          marginTop: 'auto',
        }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Main Footer Content - navigation and key links only */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-2xl)',
            marginBottom: 'var(--spacing-2xl)',
          }}>
            {/* Quick Links Section */}
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}>
                Пайвандҳои зуд
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
              }}>
                <FooterLink
                  icon={<LocalIcon name="home" style={{ width: '18px', height: '18px' }} />}
                  text="Асосӣ"
                  url="/"
                />
                <FooterLink
                  icon={<LocalIcon name="book" style={{ width: '18px', height: '18px' }} />}
                  text="Қуръон"
                  url="/quran"
                />
                <FooterLink
                  icon={<LocalIcon name="school" style={{ width: '18px', height: '18px' }} />}
                  text="Омӯзиш"
                  url="/learn-words"
                />
                <FooterLink
                  icon={<LocalIcon name="musical-notes" style={{ width: '18px', height: '18px' }} />}
                  text="Қироат"
                  url="/audio-home"
                />
                <FooterLink
                  icon={<LocalIcon name="chatbubbles" style={{ width: '18px', height: '18px' }} />}
                  text="Иқтибосҳо аз Қуръон"
                  url="/quoted-verses"
                />
                <FooterLink
                  icon={<LocalIcon name="people" style={{ width: '18px', height: '18px' }} />}
                  text="Пайғамбарон"
                  url="/prophets"
                />
                <FooterLink
                  icon={<LocalIcon name="heart" style={{ width: '18px', height: '18px' }} />}
                  text="Дуоҳо"
                  url="/duas"
                />
                <FooterLink
                  icon={<LocalIcon name="images" style={{ width: '18px', height: '18px' }} />}
                  text="Галерея"
                  url="/gallery"
                />
                <FooterLink
                  icon={<LocalIcon name="download" style={{ width: '18px', height: '18px' }} />}
                  text="Махзани Маърифат"
                  url="/downloads"
                />
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            borderTop: '1px solid var(--color-outline)',
            paddingTop: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-xl)',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
              margin: 0,
            }}>
              Ҳамаи ҳуқуқҳо ба муаллифон ва манбаъҳои мутобиқ тааллуқ доранд.
            </p>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
              marginTop: 'var(--spacing-sm)',
              fontStyle: 'italic',
            }}>
              Маводҳо дар ин барнома аз манбаъҳои гуногун ҷамъоварӣ шудаанд, аз ҷумла: матни Қуръон, тарҷумаҳо, қироатҳои аудиоӣ ва тафсир.
            </p>
            {/* Legal/credit info and social links moved to very bottom as small-print */}
            <div
              style={{
                marginTop: 'var(--spacing-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6',
              }}
            >
              <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                Ташаккури махсус ба: 
                {' '}
                <a
                  href="https://alquran.cloud/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  AlQuran Cloud
                </a>
                {', '}
                <a
                  href="https://tanzil.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  Tanzil.net
                </a>
                {', '}
                <a
                  href="https://alquran.cloud/cdn"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  CDN Islamic Network
                </a>
                {', '}
                <a
                  href="https://t.me/Qurantajik"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  Акмал Мансуров
                </a>
                {', '}
                Абуаломуддин
                {', '}
                <a
                  href="https://qul.tarteel.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  Quranic Universal Library
                </a>
                .
              </div>
              <div>
                Мо дар:
                {' '}
                <a
                  href="https://www.instagram.com/quran.tj.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  Instagram
                </a>
                {', '}
                Facebook
                {', '}
                <a
                  href="https://www.youtube.com/@balkhiverse"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  YouTube
                </a>
                {', '}
                <a
                  href="https://play.google.com/store/apps/details?id=com.quran.tj.quranapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  барномаи мобилӣ
                </a>
                {' '}
                ва
                {' '}
                <a
                  href="mailto:info@quran.tj?subject=Тамос%20бо%20барномаи%20Қуръон"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  info@quran.tj
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Dialog */}
      {showPrivacyDialog && (
        <PrivacyDialog onClose={() => setShowPrivacyDialog(false)} />
      )}

      {/* Share Rate Dialog */}
      {showShareRateDialog && (
        <ShareRateDialog onClose={() => setShowShareRateDialog(false)} />
      )}
    </>
  );
}

// Footer Link Component
function FooterLink({
  icon,
  text,
  url,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  url?: string | null;
  onClick?: () => void;
}) {
  const isInternalLink = url && (url.startsWith('/') || url.startsWith('#'));
  const isExternalLink = url && !isInternalLink;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (isExternalLink) {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    // For internal links, let Next.js Link handle navigation
  };

  const linkStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        cursor: (url || onClick) ? 'pointer' : 'default',
        opacity: (url || onClick) ? 1 : 0.6,
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
    textDecoration: 'none',
        transition: 'color 0.2s ease',
  };

  const content = (
    <>
      {icon}
      <span>{text}</span>
    </>
  );

  // Use Next.js Link for internal links
  if (isInternalLink) {
    return (
      <Link
        href={url}
        onClick={handleClick}
        style={linkStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        {content}
      </Link>
    );
  }

  // Use div with onClick for external links or no link
  return (
    <div
      onClick={handleClick}
      style={linkStyle}
      onMouseEnter={(e) => {
        if (url || onClick) {
          e.currentTarget.style.color = 'var(--color-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (url || onClick) {
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }
      }}
    >
      {content}
    </div>
  );
}

// Privacy Dialog Component
function PrivacyDialog({ onClose }: { onClose: () => void }) {
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: '16px',
        }}>
          Сиёсати махфият
        </div>
        <div style={{
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-primary)',
          lineHeight: '1.6',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: '4px' }}>
              Санаи эътибор:
            </div>
            <div>17 октябри 2025</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: '8px',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          Пӯшидан
        </button>
      </div>
    </div>
  );
}

// Share Rate Dialog Component
function ShareRateDialog({ onClose }: { onClose: () => void }) {
  const handleShare = async () => {
    const appName = 'Қуръон бо Тафсири Осонбаён';
    const appDescription = 'Барномаи комил барои хондани Қуръон бо тафсири осонбаён';
    const shareText = `${appName}\n${appDescription}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: appName,
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Матн нусхабардорӣ карда шуд');
    }
  };

  return (
    <div
      data-nosnippet
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LocalIcon name="heart" style={{ width: '48px', height: '48px', color: 'var(--color-primary)' }} />
          </div>
        </div>
        <div style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center',
          marginBottom: '12px',
        }}>
          Барномаро дастгирӣ кунед
        </div>
        <div style={{
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          lineHeight: '1.5',
          marginBottom: '24px',
        }}>
          Агар барнома ба шумо писанд омад, лутфан онро бо дӯстон ва наздикон мубодила кунед ё дар Play Store баҳо диҳед. Аллоҳ аз шумо розӣ бошад!
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              borderRadius: '12px',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
            }}
          >
            Мубодила
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
            }}
          >
            Пӯшидан
          </button>
        </div>
      </div>
    </div>
  );
}

