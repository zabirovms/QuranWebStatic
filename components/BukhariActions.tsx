'use client';

import { useState } from 'react';
import { CopyIcon, ShareIcon, CheckCircleIcon } from './Icons';

interface BukhariActionsProps {
  hadithText: string;
  hadithNumber: number;
  chapterTitle: string;
  bookTitle: string;
}

export default function BukhariActions({
  hadithText,
  hadithNumber,
  chapterTitle,
  bookTitle,
}: BukhariActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hadithText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    const shareText = `${bookTitle} - ${chapterTitle}\n\n${hadithText}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ҳадис ${hadithNumber}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: '16px',
      gap: '4px',
    }}>
      {/* Reference Number */}
      <div
        title={`Ҳадис ${hadithNumber}`}
        style={{
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          cursor: 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color var(--transition-base)',
        }}
      >
        <span style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          fontWeight: '500',
        }}>
          {hadithNumber}
        </span>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}>
        <div
          title={copied ? 'Нусхабардорӣ шуд!' : 'Нусхабардорӣ'}
          onClick={handleCopy}
          style={{
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color var(--transition-base)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {copied ? (
            <CheckCircleIcon size={18} color="var(--color-primary)" />
          ) : (
            <CopyIcon size={18} color="var(--color-text-secondary)" />
          )}
        </div>
        
        <div
          title="Мубодила"
          onClick={handleShare}
          style={{
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color var(--transition-base)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ShareIcon size={18} color="var(--color-text-secondary)" />
        </div>
      </div>
    </div>
  );
}
