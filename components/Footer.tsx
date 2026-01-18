'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FavoriteIcon, 
  PrivacyTipIcon, 
  CloudIcon, 
  LanguageIcon, 
  AudiotrackIcon, 
  PersonIcon, 
  LibraryBooksIcon, 
  InstagramIcon, 
  FacebookIcon, 
  YouTubeIcon, 
  EmailIcon 
} from './Icons';


export default function Footer() {
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showShareRateDialog, setShowShareRateDialog] = useState(false);

  return (
    <>
      <footer style={{
        backgroundColor: 'var(--color-surface-variant)',
        borderTop: '1px solid var(--color-outline)',
        padding: 'var(--spacing-2xl) var(--spacing-lg)',
        marginTop: 'auto',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Main Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-2xl)',
            marginBottom: 'var(--spacing-2xl)',
          }}>
            {/* Special Thanks Section */}
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}>
                Ташаккури махсус
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
              }}>
                <FooterLink
                  icon={<CloudIcon size={18} color="#2196F3" />}
                  text="AlQuran Cloud"
                  url="https://alquran.cloud/"
                />
                <FooterLink
                  icon={<LanguageIcon size={18} color="#4CAF50" />}
                  text="Tanzil.net"
                  url="https://tanzil.net/"
                />
                <FooterLink
                  icon={<AudiotrackIcon size={18} color="#FF9800" />}
                  text="CDN Islamic Network"
                  url="https://alquran.cloud/cdn"
                />
                <FooterLink
                  icon={<PersonIcon size={18} color="#0088CC" />}
                  text="Акмал Мансуров"
                  url="https://t.me/Qurantajik"
                />
                <FooterLink
                  icon={<PersonIcon size={18} color="#009688" />}
                  text="Абуаломуддин"
                  url={null}
                />
                <FooterLink
                  icon={<LibraryBooksIcon size={18} color="#9C27B0" />}
                  text="Quranic Universal Library"
                  url="https://qul.tarteel.ai/"
                />
              </div>
            </div>

            {/* Social Links Section */}
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}>
                Мо дар:
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
              }}>
                <FooterLink
                  icon={<InstagramIcon size={18} color="#E4405F" />}
                  text="Instagram"
                  url="https://www.instagram.com/quran.tj.official"
                />
                <FooterLink
                  icon={<FacebookIcon size={18} color="#1877F2" />}
                  text="Facebook"
                  url={null}
                />
                <FooterLink
                  icon={<YouTubeIcon size={18} color="#FF0000" />}
                  text="YouTube"
                  url="https://www.youtube.com/@balkhiverse"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>📱</span>}
                  text="Барномаи мобилӣ"
                  url="https://play.google.com/store/apps/details?id=com.quran.tj.quranapp"
                />
                <FooterLink
                  icon={<EmailIcon size={18} color="var(--color-primary)" />}
                  text="info@quran.tj"
                  url="mailto:info@quran.tj?subject=Тамос%20бо%20барномаи%20Қуръон"
                />
              </div>
            </div>

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
                  icon={<span style={{ fontSize: '18px' }}>🏠</span>}
                  text="Асосӣ"
                  url="/"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>📖</span>}
                  text="Қуръон"
                  url="/quran"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>📚</span>}
                  text="Омӯзиш"
                  url="/learn-words"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>🎵</span>}
                  text="Қироат"
                  url="/audio-home"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>💬</span>}
                  text="Иқтибосҳо аз Қуръон"
                  url="/quoted-verses"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>👤</span>}
                  text="Пайғамбарон"
                  url="/prophets"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>🙏</span>}
                  text="Дуоҳо"
                  url="/duas"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>🖼️</span>}
                  text="Галерея"
                  url="/gallery"
                />
                <FooterLink
                  icon={<span style={{ fontSize: '18px' }}>📚</span>}
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
            <FavoriteIcon size={48} color="var(--color-primary)" />
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

