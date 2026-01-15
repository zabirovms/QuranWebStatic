'use client';

export enum GalleryLayout {
  WITH_TEXT = 'withText',
  ZARDEVOR = 'zardevor',
}

interface GalleryLayoutSwitcherProps {
  activeLayout: GalleryLayout;
  onLayoutChange: (layout: GalleryLayout) => void;
}

export default function GalleryLayoutSwitcher({
  activeLayout,
  onLayoutChange,
}: GalleryLayoutSwitcherProps) {
  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: 'var(--color-background)',
      borderBottom: '1px solid var(--color-outline)',
    }}>
      <div style={{
        padding: '4px',
        backgroundColor: 'var(--color-surface-variant)',
        borderRadius: '16px',
        display: 'flex',
        gap: '4px',
      }}>
        <button
          onClick={() => onLayoutChange(GalleryLayout.WITH_TEXT)}
          style={{
            flex: 1,
            padding: '10px 8px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeLayout === GalleryLayout.WITH_TEXT
              ? 'var(--color-primary)'
              : 'transparent',
            color: activeLayout === GalleryLayout.WITH_TEXT
              ? 'var(--color-on-primary)'
              : 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            fontWeight: activeLayout === GalleryLayout.WITH_TEXT ? '600' : 'normal',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          Бо матн
        </button>
        <button
          onClick={() => onLayoutChange(GalleryLayout.ZARDEVOR)}
          style={{
            flex: 1,
            padding: '10px 8px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeLayout === GalleryLayout.ZARDEVOR
              ? 'var(--color-primary)'
              : 'transparent',
            color: activeLayout === GalleryLayout.ZARDEVOR
              ? 'var(--color-on-primary)'
              : 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            fontWeight: activeLayout === GalleryLayout.ZARDEVOR ? '600' : 'normal',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
          </svg>
          Зардевор
        </button>
      </div>
    </div>
  );
}

