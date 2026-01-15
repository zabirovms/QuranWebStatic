'use client';

import { useState, useRef, useEffect } from 'react';
import { getReciters, Reciter } from '@/lib/data/reciter-data-client';
import { SettingsService } from '@/lib/services/settings-service';

interface ReciterDropdownProps {
  currentReciterId: string;
  onReciterSelected: (reciterId: string) => void;
  trigger: React.ReactNode;
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

function getDisplayName(reciter: Reciter): string {
  if (reciter.nameTajik && reciter.nameTajik !== reciter.id) {
    return reciter.nameTajik;
  }
  if (reciter.name && reciter.name !== reciter.id) {
    return reciter.name;
  }
  return 'Қорӣ';
}

export default function ReciterDropdown({
  currentReciterId,
  onReciterSelected,
  trigger,
}: ReciterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const settingsService = SettingsService.getInstance();

  useEffect(() => {
    if (isOpen && reciters.length === 0) {
      loadReciters();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, reciters]);

  const loadReciters = async () => {
    setIsLoading(true);
    try {
      const allReciters = await getReciters();
      const verseByVerseReciters = allReciters.filter(r => r.hasVerseByVerse);
      setReciters(verseByVerseReciters);
    } catch (error) {
      console.error('Error loading reciters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (reciterId: string) => {
    settingsService.setAudioEdition(reciterId);
    onReciterSelected(reciterId);
    setIsOpen(false);
  };

  const categorized = categorizeReciters(reciters);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        {trigger}
      </div>
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2002,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 'var(--spacing-xs)',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-outline)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--elevation-8)',
              minWidth: '320px',
              maxWidth: '400px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 2003,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {isLoading ? (
              <div style={{ 
                padding: 'var(--spacing-xl)', 
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}>
                Боргирӣ карда истодааст...
              </div>
            ) : reciters.length === 0 ? (
              <div style={{ 
                padding: 'var(--spacing-xl)', 
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}>
                Ҳеҷ қорӣ ёфт нашуд
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Murattal */}
                {categorized.murattal.length > 0 && (
                  <>
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-primary)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--color-surface-variant)',
                      borderBottom: '1px solid var(--color-outline)',
                    }}>
                      Мураттал (Оҳиста)
                    </div>
                    {categorized.murattal.map((reciter) => (
                      <div
                        key={reciter.id}
                        onClick={() => handleSelect(reciter.id)}
                        style={{
                          padding: 'var(--spacing-md)',
                          cursor: 'pointer',
                          backgroundColor: currentReciterId === reciter.id
                            ? 'var(--color-primary-container-low-opacity)'
                            : 'transparent',
                          borderBottom: '1px solid var(--color-outline)',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (currentReciterId !== reciter.id) {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentReciterId !== reciter.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          fontSize: 'var(--font-size-base)',
                          fontWeight: currentReciterId === reciter.id
                            ? 'var(--font-weight-semibold)'
                            : 'var(--font-weight-normal)',
                          color: currentReciterId === reciter.id
                            ? 'var(--color-primary)'
                            : 'var(--color-text-primary)',
                        }}>
                          {getDisplayName(reciter)}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Mujawwad */}
                {categorized.mujawwad.length > 0 && (
                  <>
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-primary)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--color-surface-variant)',
                      borderBottom: '1px solid var(--color-outline)',
                    }}>
                      Муҷаввад (Муътадил)
                    </div>
                    {categorized.mujawwad.map((reciter) => (
                      <div
                        key={reciter.id}
                        onClick={() => handleSelect(reciter.id)}
                        style={{
                          padding: 'var(--spacing-md)',
                          cursor: 'pointer',
                          backgroundColor: currentReciterId === reciter.id
                            ? 'var(--color-primary-container-low-opacity)'
                            : 'transparent',
                          borderBottom: '1px solid var(--color-outline)',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (currentReciterId !== reciter.id) {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentReciterId !== reciter.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          fontSize: 'var(--font-size-base)',
                          fontWeight: currentReciterId === reciter.id
                            ? 'var(--font-weight-semibold)'
                            : 'var(--font-weight-normal)',
                          color: currentReciterId === reciter.id
                            ? 'var(--color-primary)'
                            : 'var(--color-text-primary)',
                        }}>
                          {getDisplayName(reciter)}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Translations */}
                {categorized.translations.length > 0 && (
                  <>
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-primary)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--color-surface-variant)',
                      borderBottom: '1px solid var(--color-outline)',
                    }}>
                      Тарҷумаҳо
                    </div>
                    {categorized.translations.map((reciter) => {
                      const flag = getFlagForTranslation(reciter.id);
                      return (
                        <div
                          key={reciter.id}
                          onClick={() => handleSelect(reciter.id)}
                          style={{
                            padding: 'var(--spacing-md)',
                            cursor: 'pointer',
                            backgroundColor: currentReciterId === reciter.id
                              ? 'var(--color-primary-container-low-opacity)'
                              : 'transparent',
                            borderBottom: '1px solid var(--color-outline)',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (currentReciterId !== reciter.id) {
                              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentReciterId !== reciter.id) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: currentReciterId === reciter.id
                              ? 'var(--font-weight-semibold)'
                              : 'var(--font-weight-normal)',
                            color: currentReciterId === reciter.id
                              ? 'var(--color-primary)'
                              : 'var(--color-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                          }}>
                            {flag && <span style={{ fontSize: '18px' }}>{flag}</span>}
                            <span>{getDisplayName(reciter)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Others */}
                {categorized.others.length > 0 && (
                  <>
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-primary)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--color-surface-variant)',
                      borderBottom: '1px solid var(--color-outline)',
                    }}>
                      Дигар қориҳо
                    </div>
                    {categorized.others.map((reciter) => (
                      <div
                        key={reciter.id}
                        onClick={() => handleSelect(reciter.id)}
                        style={{
                          padding: 'var(--spacing-md)',
                          cursor: 'pointer',
                          backgroundColor: currentReciterId === reciter.id
                            ? 'var(--color-primary-container-low-opacity)'
                            : 'transparent',
                          borderBottom: '1px solid var(--color-outline)',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (currentReciterId !== reciter.id) {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentReciterId !== reciter.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          fontSize: 'var(--font-size-base)',
                          fontWeight: currentReciterId === reciter.id
                            ? 'var(--font-weight-semibold)'
                            : 'var(--font-weight-normal)',
                          color: currentReciterId === reciter.id
                            ? 'var(--color-primary)'
                            : 'var(--color-text-primary)',
                        }}>
                          {getDisplayName(reciter)}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

