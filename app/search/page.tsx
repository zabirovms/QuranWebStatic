'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchDrawer from '@/components/SearchDrawer';
import LoadingSpinner from '@/components/LoadingSpinner';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [isOpen, setIsOpen] = useState(true);

  // Auto-open drawer when page loads
  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <SearchDrawer
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        // Navigate back after a short delay to allow animation
        setTimeout(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = '/';
          }
        }, 300);
      }}
      initialQuery={initialQuery}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
        display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
        <LoadingSpinner size="large" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
