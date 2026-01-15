'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string | ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📭',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--color-text-primary)',
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '64px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      )}
      {title && (
        <h3
          className="headline-small"
          style={{
            marginBottom: '8px',
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h3>
      )}
      {message && (
        <p
          className="body-medium"
          style={{
            marginBottom: '24px',
            color: 'var(--color-text-secondary)',
            maxWidth: '400px',
          }}
        >
          {message}
        </p>
      )}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="btn btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

