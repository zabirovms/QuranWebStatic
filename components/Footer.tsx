'use client';

import Link from 'next/link';
import LocalIcon from './LocalIcon';

export default function Footer() {
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
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => onClick());
      } else {
        onClick();
      }
    } else if (isExternalLink) {
      e.preventDefault();
      // Defer open so tap handler returns quickly (better INP)
      const targetUrl = url;
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => window.open(targetUrl, '_blank', 'noopener,noreferrer'));
      } else {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
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

