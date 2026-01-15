'use client';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export default function SkeletonLoader({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
}: SkeletonLoaderProps) {
  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        backgroundColor: 'var(--color-outline)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

