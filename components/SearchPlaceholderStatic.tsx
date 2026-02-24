import { SearchIcon } from './Icons';

export default function SearchPlaceholderStatic() {
  return (
    <div
      style={{
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '64px',
          padding: '0 12px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '32px',
          border: '2px solid var(--color-primary-low-opacity)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-size-lg)',
          position: 'relative',
          cursor: 'text',
        }}
      >
        <SearchIcon size={24} color="var(--color-text-secondary)" />
        <span
          style={{
            marginLeft: '12px',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-lg)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Ҷустуҷӯ дар Қуръон...
        </span>
      </div>
    </div>
  );
}

