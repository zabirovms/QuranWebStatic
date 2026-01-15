'use client';

import { useState, useEffect } from 'react';
import { getReciters, Reciter } from '@/lib/data/reciter-data-client';
import { SettingsService } from '@/lib/services/settings-service';
import { CloseIcon } from './Icons';

interface ReciterSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentReciterId: string;
  onReciterSelected: (reciterId: string) => void;
}

// Categorize reciters like Flutter
function categorizeReciters(reciters: Reciter[]) {
  const murattalIds = new Set([
    'ar.abdulbasitmurattal',
    'ar.abdullahbasfar',
    'ar.abdulsamad',
    'ar.hudhaify',
    'ar.ibrahimakhbar',
  ]);

  const mujawwadIds = new Set([
    'ar.husarymujawwad',
    'ar.minshawimujawwad',
  ]);

  const translationIds = new Set([
    'fr.leclerc',
    'ru.kuliev-audio',
    'zh.chinese',
    'en.walk',
    'fa.hedayatfarfooladvand',
    'ur.khan',
  ]);

  const murattal: Reciter[] = [];
  const mujawwad: Reciter[] = [];
  const translations: Reciter[] = [];
  const others: Reciter[] = [];

  reciters.forEach((reciter) => {
    if (translationIds.has(reciter.id)) {
      translations.push(reciter);
    } else if (mujawwadIds.has(reciter.id) || 
               reciter.nameTajik.toLowerCase().includes('муҷаввад')) {
      mujawwad.push(reciter);
    } else if (murattalIds.has(reciter.id) ||
               reciter.nameTajik.toLowerCase().includes('мураттал')) {
      murattal.push(reciter);
    } else {
      others.push(reciter);
    }
  });

  // Sort each category
  murattal.sort((a, b) => a.nameTajik.localeCompare(b.nameTajik));
  mujawwad.sort((a, b) => a.nameTajik.localeCompare(b.nameTajik));
  translations.sort((a, b) => {
    const priorityA = getTranslationPriority(a.id);
    const priorityB = getTranslationPriority(b.id);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.nameTajik.localeCompare(b.nameTajik);
  });
  others.sort((a, b) => a.nameTajik.localeCompare(b.nameTajik));

  return { murattal, mujawwad, translations, others };
}

function getTranslationPriority(reciterId: string): number {
  if (reciterId.startsWith('fa.')) return 1;
  if (reciterId.startsWith('ru.')) return 2;
  if (reciterId.startsWith('en.')) return 3;
  return 4;
}

function getFlagForTranslation(reciterId: string): string | null {
  const flags: Record<string, string> = {
    'fa.': '🇮🇷',
    'ru.': '🇷🇺',
    'en.': '🇬🇧',
    'fr.': '🇫🇷',
    'ur.': '🇵🇰',
    'zh.': '🇨🇳',
    'tr.': '🇹🇷',
    'id.': '🇮🇩',
    'ms.': '🇲🇾',
    'bn.': '🇧🇩',
    'hi.': '🇮🇳',
  };

  for (const [prefix, flag] of Object.entries(flags)) {
    if (reciterId.startsWith(prefix)) return flag;
  }
  return null;
}

export default function ReciterSelectionDialog({
  isOpen,
  onClose,
  currentReciterId,
  onReciterSelected,
}: ReciterSelectionDialogProps) {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const settingsService = SettingsService.getInstance();

  useEffect(() => {
    if (isOpen) {
      loadReciters();
    }
  }, [isOpen]);

  const loadReciters = async () => {
    setIsLoading(true);
    try {
      const allReciters = await getReciters();
      // Filter to only verse-by-verse reciters (matching Flutter)
      const verseByVerseReciters = allReciters.filter(r => r.hasVerseByVerse);
      setReciters(verseByVerseReciters);
    } catch (error) {
      console.error('Error loading reciters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelect = (reciterId: string) => {
    settingsService.setAudioEdition(reciterId);
    onReciterSelected(reciterId);
    onClose();
  };

  const getDisplayName = (reciter: Reciter): string => {
    if (reciter.nameTajik && reciter.nameTajik !== reciter.id) {
      return reciter.nameTajik;
    }
    if (reciter.name && reciter.name !== reciter.id) {
      return reciter.name;
    }
    return 'Қорӣ';
  };

  const categorized = categorizeReciters(reciters);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          padding: 'var(--spacing-xl)',
          position: 'relative',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--spacing-md)',
            right: 'var(--spacing-md)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--spacing-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloseIcon size={24} color="var(--color-text-secondary)" />
        </button>

        <h2 className="headline-medium" style={{ marginBottom: 'var(--spacing-xl)' }}>
          Интихоби қорӣ
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            Боргирӣ карда истодааст...
          </div>
        ) : reciters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            Ҳеҷ қорӣ бо дастгирии ояти ҷудогона ёфт нашуд
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* Murattal */}
            {categorized.murattal.length > 0 && (
              <>
                <div className="label-medium" style={{ 
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-bold)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                }}>
                  Мураттал (Оҳиста)
                </div>
                {categorized.murattal.map((reciter) => (
                  <ReciterTile
                    key={reciter.id}
                    reciter={reciter}
                    isSelected={currentReciterId === reciter.id}
                    onSelect={() => handleSelect(reciter.id)}
                    getDisplayName={getDisplayName}
                  />
                ))}
              </>
            )}

            {/* Mujawwad */}
            {categorized.mujawwad.length > 0 && (
              <>
                <div className="label-medium" style={{ 
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-bold)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  marginTop: 'var(--spacing-sm)',
                }}>
                  Муҷаввад (Муътадил)
                </div>
                {categorized.mujawwad.map((reciter) => (
                  <ReciterTile
                    key={reciter.id}
                    reciter={reciter}
                    isSelected={currentReciterId === reciter.id}
                    onSelect={() => handleSelect(reciter.id)}
                    getDisplayName={getDisplayName}
                  />
                ))}
              </>
            )}

            {/* Translations */}
            {categorized.translations.length > 0 && (
              <>
                <div className="label-medium" style={{ 
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-bold)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  marginTop: 'var(--spacing-sm)',
                }}>
                  Тарҷумаҳо
                </div>
                {categorized.translations.map((reciter) => {
                  const flag = getFlagForTranslation(reciter.id);
                  return (
                    <ReciterTile
                      key={reciter.id}
                      reciter={reciter}
                      isSelected={currentReciterId === reciter.id}
                      onSelect={() => handleSelect(reciter.id)}
                      getDisplayName={getDisplayName}
                      flag={flag}
                    />
                  );
                })}
              </>
            )}

            {/* Others */}
            {categorized.others.length > 0 && (
              <>
                <div className="label-medium" style={{ 
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-bold)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  marginTop: 'var(--spacing-sm)',
                }}>
                  Дигар қориҳо
                </div>
                {categorized.others.map((reciter) => (
                  <ReciterTile
                    key={reciter.id}
                    reciter={reciter}
                    isSelected={currentReciterId === reciter.id}
                    onSelect={() => handleSelect(reciter.id)}
                    getDisplayName={getDisplayName}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReciterTile({
  reciter,
  isSelected,
  onSelect,
  getDisplayName,
  flag,
}: {
  reciter: Reciter;
  isSelected: boolean;
  onSelect: () => void;
  getDisplayName: (reciter: Reciter) => string;
  flag?: string | null;
}) {
  return (
    <label
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'background-color var(--transition-base)',
        backgroundColor: isSelected ? 'var(--color-primary-container-low-opacity)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <input
        type="radio"
        name="reciter"
        value={reciter.id}
        checked={isSelected}
        onChange={onSelect}
        style={{
          marginRight: 'var(--spacing-md)',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
        }}
      />
      {flag && <span style={{ marginRight: 'var(--spacing-sm)', fontSize: '18px' }}>{flag}</span>}
      <span className="body-medium">{getDisplayName(reciter)}</span>
    </label>
  );
}

