import LoadingSpinner from '@/components/LoadingSpinner';

export default function SurahLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <LoadingSpinner size="large" />
    </div>
  );
}

