'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { Surah } from '@/lib/types';
import { CloseIcon } from './Icons';

interface NavigationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurah?: number;
}

export default function NavigationDialog({
  isOpen,
  onClose,
  currentSurah = 1,
}: NavigationDialogProps) {
  const router = useRouter();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState(currentSurah);
  const [verseInput, setVerseInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedSurah(currentSurah);
      setVerseInput('');
      loadSurahs();
    }
  }, [isOpen, currentSurah]);

  const loadSurahs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllSurahs();
      setSurahs(data);
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = () => {
    if (selectedSurah < 1 || selectedSurah > 114) {
      alert('Рақами сура бояд аз 1 то 114 бошад');
      return;
    }

    const verseText = verseInput.trim();
    if (verseText !== '') {
      const verseNumber = parseInt(verseText, 10);
      if (isNaN(verseNumber) || verseNumber < 1) {
        alert('Рақами оят нодуруст аст');
        return;
      }
      // Navigate to surah page with verse parameter
      router.push(`/surah/${selectedSurah}?verse=${verseNumber}`);
    } else {
      // Navigate to surah page without verse
      router.push(`/surah/${selectedSurah}`);
    }
    onClose();
  };

  const selectedSurahData = surahs.find(s => s.number === selectedSurah);

  if (!isOpen) return null;

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
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '400px',
          width: '90%',
          maxHeight: '80vh',
          padding: 'var(--spacing-xl)',
          position: 'relative',
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

        <h2 className="headline-small" style={{ marginBottom: 'var(--spacing-xl)' }}>
          Навигатсия
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            Боргирӣ карда истодааст...
          </div>
        ) : (
          <>
            {/* Surah selector */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="label-medium" style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-text-primary)',
              }}>
                Сура
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSurahDropdown(!showSurahDropdown)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedSurahData 
                      ? `${selectedSurah}. Сураи ${selectedSurahData.nameTajik}`
                      : `Сураи ${selectedSurah}`
                    }
                  </span>
                  <span style={{ fontSize: '20px', color: 'var(--color-text-secondary)' }}>▼</span>
                </button>

                {showSurahDropdown && (
                  <>
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1001,
                      }}
                      onClick={() => setShowSurahDropdown(false)}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-outline)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--elevation-4)',
                        zIndex: 1002,
                      }}
                    >
                      {surahs.map((surah) => (
                        <button
                          key={surah.number}
                          onClick={() => {
                            setSelectedSurah(surah.number);
                            setShowSurahDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            padding: 'var(--spacing-md)',
                            border: 'none',
                            background: selectedSurah === surah.number 
                              ? 'var(--color-primary-container-low-opacity)' 
                              : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-primary)',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedSurah !== surah.number) {
                              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedSurah !== surah.number) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {surah.number}. Сураи {surah.nameTajik}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Verse input */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label className="label-medium" style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-text-primary)',
              }}>
                Оят (ихтиёрӣ)
              </label>
              <input
                type="number"
                min="1"
                value={verseInput}
                onChange={(e) => setVerseInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleNavigate();
                  }
                }}
                placeholder="Рақами оят"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                }}
                autoFocus
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Бекор кардан
              </button>
              <button
                onClick={handleNavigate}
                className="btn btn-primary"
              >
                Рафтан
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

