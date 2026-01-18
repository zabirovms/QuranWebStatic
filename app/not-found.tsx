import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background)',
      padding: 'var(--spacing-xl)',
      position: 'relative',
    }}>
      {/* SVG Container with relative positioning for overlay */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '960px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* SVG Image */}
        <img
          src="/not-found.svg"
          alt="404 - Саҳифа ёфт нашуд"
          className="not-found-svg"
          style={{
            width: '100%',
            height: 'auto',
            maxWidth: '960px',
            display: 'block',
          }}
        />

        {/* Clickable overlay for "Ба саҳифаи Асосӣ" button */}
        {/* Based on SVG clipPath coordinates: x:248.078125-448.171875, y:453.585938-500.746094 */}
        <Link
          href="/"
          className="not-found-overlay-link"
          aria-label="Ба саҳифаи Асосӣ"
          title="Ба саҳифаи Асосӣ"
        />
      </div>
    </div>
  );
}
