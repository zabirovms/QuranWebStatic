'use client';

import { Suspense, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SearchParamsWrapperProps {
  children: ReactNode;
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
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
      {children}
    </Suspense>
  );
}
