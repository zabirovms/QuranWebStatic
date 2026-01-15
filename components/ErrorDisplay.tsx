'use client';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorDisplay({
  title = 'Хатогӣ',
  message,
  onRetry,
  retryLabel = 'Боз кӯшиш кунед',
}: ErrorDisplayProps) {
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
      <div
        style={{
          fontSize: '48px',
          marginBottom: '16px',
        }}
      >
        ⚠️
      </div>
      <h3
        className="headline-small"
        style={{
          marginBottom: '8px',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h3>
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
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

