'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { prayerTimesService } from '@/lib/services/prayer-times-service';
import type { PrayerTime, PrayerTimesMonth, PrayerDay } from '@/lib/types/prayer-times';
import DynamicMetadata from '@/components/DynamicMetadata';
import PrayerTimesStructuredData from '@/components/PrayerTimesStructuredData';

export default function PrayerTimesPage() {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState<PrayerTimesMonth | null>(null);
  const [fullMonthData, setFullMonthData] = useState<PrayerDay[]>([]);
  const [todayPrayerTimes, setTodayPrayerTimes] = useState<PrayerTime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthFileName = prayerTimesService.getMonthFileName(year, month);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadPrayerTimes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load available files if not loaded
      if (availableFiles.length === 0) {
        const files = await prayerTimesService.fetchAvailableFiles();
        setAvailableFiles(files);
      }

      // Check if month file exists
      if (!availableFiles.includes(monthFileName) && availableFiles.length > 0) {
        setError(`Вақтҳои намоз барои ${year}-${String(month).padStart(2, '0')} дастрас нест`);
        setIsLoading(false);
        return;
      }

      // Load month data
      const data = await prayerTimesService.fetchMonthPrayerTimes(monthFileName);
      setMonthData(data);

      // Load full month data with all details
      const fullData = await prayerTimesService.fetchFullMonthData(monthFileName);
      setFullMonthData(fullData.days);

      // Load today's prayer times
      const today = await prayerTimesService.getTodayPrayerTimes();
      setTodayPrayerTimes(today);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Хатоги дар боргирии вақтҳои намоз';
      setError(errorMessage);
      console.error('Failed to load prayer times:', err);
    } finally {
      setIsLoading(false);
    }
  }, [year, month, monthFileName, availableFiles]);

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleSearch = () => {
    if (selectedYear && selectedMonth) {
      const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay || 1);
      setCurrentDate(newDate);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate < today && !isToday(day);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // Format Gregorian date with Tajik month names
  const formatGregorianDate = (date: Date): string => {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${monthNames[monthIndex]} ${year}`;
  };

  // Convert weekday from JSON (might be in Russian) to Tajik
  const getTajikWeekday = (weekday: string): string => {
    const weekdayMap: { [key: string]: string } = {
      // Russian to Tajik
      'Понедельник': 'Душанбе',
      'Вторник': 'Сешанбе',
      'Среда': 'Чоршанбе',
      'Четверг': 'Панҷшанбе',
      'Пятница': 'Ҷумъа',
      'Суббота': 'Шанбе',
      'Воскресенье': 'Якшанбе',
      // English to Tajik
      'Monday': 'Душанбе',
      'Tuesday': 'Сешанбе',
      'Wednesday': 'Чоршанбе',
      'Thursday': 'Панҷшанбе',
      'Friday': 'Ҷумъа',
      'Saturday': 'Шанбе',
      'Sunday': 'Якшанбе',
      // Already in Tajik
      'Якшанбе': 'Якшанбе',
      'Душанбе': 'Душанбе',
      'Сешанбе': 'Сешанбе',
      'Чоршанбе': 'Чоршанбе',
      'Панҷшанбе': 'Панҷшанбе',
      'Ҷумъа': 'Ҷумъа',
      'Шанбе': 'Шанбе',
    };
    return weekdayMap[weekday] || weekday;
  };

  // Get weekday abbreviation
  const getWeekdayAbbr = (weekday: string): string => {
    const tajikWeekday = getTajikWeekday(weekday);
    const abbreviations: { [key: string]: string } = {
      'Якшанбе': 'Яш',
      'Душанбе': 'Дш',
      'Сешанбе': 'Сш',
      'Чоршанбе': 'Чш',
      'Панҷшанбе': 'Пш',
      'Ҷумъа': 'Ҷм',
      'Шанбе': 'Шн',
    };
    return abbreviations[tajikWeekday] || tajikWeekday;
  };

  // Convert Hijri date to use Tajik month names
  const formatHijriDate = (hijriDate: string): string => {
    const parts = hijriDate.split('.');
    if (parts.length === 3) {
      const day = parts[0];
      const monthNum = parseInt(parts[1]);
      const year = parts[2];
      const monthName = hijriMonthNames[monthNum - 1] || parts[1];
      return `${day} ${monthName} ${year}`;
    }
    return hijriDate;
  };

  // Get today's full day data
  const todayFullData = fullMonthData.find((day) => {
    const dayNum = parseInt(day.gregorian.split('.')[0]);
    return isToday(dayNum);
  });

  // Determine current prayer (the one we're currently in the time window for)
  const getCurrentPrayer = useMemo(() => {
    if (!todayFullData) return null;

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const prayers = [
      { key: 'fajr', name: 'Бомдод', time: todayFullData.fajr },
      { key: 'dhuhr', name: 'Пешин', time: todayFullData.dhuhr },
      { key: 'asr', name: 'Аср', time: todayFullData.asr },
      { key: 'maghrib', name: 'Шом', time: todayFullData.maghrib },
      { key: 'isha', name: 'Хуфтан', time: todayFullData.isha },
    ];

    for (const prayer of prayers) {
      const timeRange = prayer.time.split(' - ');
      if (timeRange.length === 2) {
        const [startTime, endTime] = timeRange;
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        let endTimeMinutes = endHours * 60 + endMinutes;
        
        // Handle Isha which might span to next day (e.g., "18:52 - 05:59")
        if (endTimeMinutes < startTimeMinutes) {
          endTimeMinutes += 24 * 60; // Add 24 hours
        }

        // Check if current time is within this prayer's time window
        if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
          return prayer.key;
        }
      }
    }

    return null;
  }, [currentTime, todayFullData]);

  const monthNames = [
    'Январ',
    'Феврал',
    'Март',
    'Апрел',
    'Май',
    'Июн',
    'Июл',
    'Август',
    'Сентябр',
    'Октябр',
    'Ноябр',
    'Декабр',
  ];

  const hijriMonthNames = [
    'Муҳаррам',
    'Сафар',
    'Рабеъ-ул Аввал',
    'Рабеъ-ул Сонӣ',
    'Ҷимод-ул Аввал',
    'Ҷимод-ул Сонӣ',
    'Раҷаб',
    'Шаъбон',
    'Рамазон',
    'Шаввол',
    'Зулқаъда',
    'Зулҳиҷа',
  ];

  return (
    <>
      <Suspense fallback={null}>
        <DynamicMetadata
          title="Вақтҳои намоз дар Душанбе - Тақвими намоз барои Тоҷикистон"
          description="Вақтҳои намоз дар Душанбе ва дигар шаҳрҳои Тоҷикистон. Тақвими комили вақтҳои намоз барои ҳар рӯз. Вақтҳои намоз мувофиқ ба маркази исломии Ҷумҳурии Тоҷикистон. Вақтҳои намоз барои шаҳрҳои Тоҷикистон: Душанбе, Хуҷанд, Кӯлоб, Бохтар ва дигар шаҳрҳо."
          canonical="https://www.quran.tj/vaqti-namoz"
        />
      </Suspense>
      <PrayerTimesStructuredData
        todayData={todayFullData}
        location="Душанбе"
        currentDate={currentTime}
      />
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <main
          style={{
            padding: 'clamp(16px, 4vw, var(--spacing-lg))',
            paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md) - 12px)' : 'calc(var(--spacing-md) - 12px)',
            transition: 'padding-top 0.4s ease-out',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Page Header */}
          <header
            style={{
              marginBottom: 'var(--spacing-xl)',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Вақтҳои намоз дар Душанбе
            </h1>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--spacing-lg)',
                flexWrap: 'wrap',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div>
                <strong>Мелодӣ:</strong> {formatGregorianDate(currentTime)}
              </div>
              {todayFullData && (
                <div>
                  <strong>Ҳиҷрӣ:</strong> {formatHijriDate(todayFullData.hijri)}
                </div>
              )}
              <div
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-primary)',
                }}
              >
                {formatTime(currentTime)}
              </div>
            </div>
          </header>

          {/* Today's Prayer Times Card */}
          {todayPrayerTimes && todayFullData && (
            <article
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-xl)',
                boxShadow: 'var(--elevation-2)',
                border: '2px solid var(--color-primary)',
              }}
            >
               <h2
                 style={{
                   fontSize: 'var(--font-size-xl)',
                   fontWeight: 'var(--font-weight-semibold)',
                   color: 'var(--color-primary)',
                   marginBottom: 'var(--spacing-lg)',
                   textAlign: 'center',
                 }}
               >
                 Вақтҳои намоз барои имрӯз - {formatGregorianDate(currentTime)} ({getTajikWeekday(todayFullData.weekday)})
               </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 'var(--spacing-md)',
                }}
              >
                {[
                  { key: 'fajr', name: 'Бомдод', time: todayFullData.fajr },
                  { key: 'dhuhr', name: 'Пешин', time: todayFullData.dhuhr },
                  { key: 'asr', name: 'Аср', time: todayFullData.asr },
                  { key: 'maghrib', name: 'Шом', time: todayFullData.maghrib },
                  { key: 'isha', name: 'Хуфтан', time: todayFullData.isha },
                ].map((prayer) => {
                  const isUpcoming = getCurrentPrayer === prayer.key;
                  const timeParts = prayer.time.split(' - ');
                  const startTime = timeParts[0];

                  return (
                    <div
                      key={prayer.key}
                      style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-md)',
                        backgroundColor: isUpcoming
                          ? 'var(--color-primary)'
                          : 'var(--color-primary-container-low-opacity)',
                        borderRadius: 'var(--radius-md)',
                        border: isUpcoming ? '2px solid var(--color-primary)' : 'none',
                        boxShadow: isUpcoming ? 'var(--elevation-2)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          color: isUpcoming
                            ? 'var(--color-on-primary)'
                            : 'var(--color-text-secondary)',
                          marginBottom: 'var(--spacing-xs)',
                        }}
                      >
                        {prayer.name}
                        {isUpcoming && (
                          <span
                            style={{
                              display: 'block',
                              fontSize: 'var(--font-size-xs)',
                              marginTop: 'var(--spacing-xs)',
                            }}
                          >
                            (Ҷорӣ)
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--font-size-xl)',
                          fontWeight: 'var(--font-weight-bold)',
                          color: isUpcoming ? 'var(--color-on-primary)' : 'var(--color-primary)',
                        }}
                      >
                        {startTime}
                      </div>
                      {timeParts.length > 1 && (
                        <div
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            color: isUpcoming
                              ? 'var(--color-on-primary)'
                              : 'var(--color-text-secondary)',
                            marginTop: 'var(--spacing-xs)',
                          }}
                        >
                          то {timeParts[1]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          )}

          {/* Search/Filter */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)',
              boxShadow: 'var(--elevation-2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ flex: '1', minWidth: '120px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-xs)',
                  }}
                >
                  Рӯз
                </label>
                <select
                  value={selectedDay || ''}
                  onChange={(e) => setSelectedDay(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-base)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="">- Интихоб -</option>
                  {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1).map(
                    (day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '140px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-xs)',
                  }}
                >
                  Моҳ
                </label>
                <select
                  value={selectedMonth || month}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-base)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {monthNames.map((name, index) => (
                    <option key={index} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '120px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-xs)',
                  }}
                >
                  Сол
                </label>
                <select
                  value={selectedYear || year}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-base)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-xl)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  whiteSpace: 'nowrap',
                }}
              >
                Ҷустуҷӯ
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--spacing-3xl)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Боргирӣ...
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--spacing-3xl)',
                color: 'var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          {/* Table View */}
          {!isLoading && !error && fullMonthData.length > 0 && (
            <section
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-lg)',
                boxShadow: 'var(--elevation-2)',
                overflowX: 'auto',
                position: 'relative',
              }}
            >
              <h2
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-lg)',
                  textAlign: 'center',
                }}
              >
                Тақвими комили вақтҳои намоз
              </h2>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  minWidth: '900px',
                }}
                role="table"
                aria-label="Тақвими вақтҳои намоз"
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--color-surface-variant)',
                      borderBottom: '2px solid var(--color-outline)',
                    }}
                  >
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'left',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Ҳафта
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'left',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Санаи мелодӣ
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'left',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Санаи ҳиҷрӣ
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Бомдод
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Пешин
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Аср
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        maxWidth: '150px',
                      }}
                    >
                      Фурӯ рафтани офтоб, гузоридани намоз макруҳ аст
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Шом
                    </th>
                    <th
                      style={{
                        padding: 'var(--spacing-md)',
                        textAlign: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-surface-variant)',
                        position: 'sticky',
                        top: isTopBarVisible ? '56px' : '0px',
                        transition: 'top 0.4s ease-out',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Хуфтан
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fullMonthData.map((day, index) => {
                    const dayNum = parseInt(day.gregorian.split('.')[0]);
                    const isTodayDay = isToday(dayNum);
                    const isPastDay = isPast(dayNum);

                    // Check if this is today and which prayer is current
                    const isCurrentPrayer = (prayerKey: string) => {
                      return isTodayDay && getCurrentPrayer === prayerKey;
                    };

                    // Format dates
                    const gregorianParts = day.gregorian.split('.');
                    const formattedGregorian =
                      gregorianParts.length === 3
                        ? `${gregorianParts[0]} ${monthNames[parseInt(gregorianParts[1]) - 1]} ${gregorianParts[2]}`
                        : day.gregorian;

                    return (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: isTodayDay
                            ? 'var(--color-primary-container-low-opacity)'
                            : isPastDay
                            ? 'var(--color-surface-variant)'
                            : 'transparent',
                          borderBottom: '1px solid var(--color-outline)',
                          opacity: isPastDay ? 0.6 : 1,
                        }}
                      >
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-primary)',
                            fontWeight: isTodayDay ? 'var(--font-weight-semibold)' : 'normal',
                          }}
                        >
                          {getWeekdayAbbr(day.weekday)}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-primary)',
                            fontWeight: isTodayDay ? 'var(--font-weight-semibold)' : 'normal',
                          }}
                        >
                          {formattedGregorian}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-primary)',
                            fontWeight: isTodayDay ? 'var(--font-weight-semibold)' : 'normal',
                          }}
                        >
                          {formatHijriDate(day.hijri)}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-base)',
                            color: isCurrentPrayer('fajr')
                              ? 'var(--color-primary)'
                              : isTodayDay
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-primary)',
                            fontWeight: isCurrentPrayer('fajr')
                              ? 'var(--font-weight-bold)'
                              : isTodayDay
                              ? 'var(--font-weight-semibold)'
                              : 'normal',
                            backgroundColor: isCurrentPrayer('fajr')
                              ? 'var(--color-primary-container-low-opacity)'
                              : 'transparent',
                            borderRadius: isCurrentPrayer('fajr') ? 'var(--radius-sm)' : '0',
                          }}
                        >
                          {day.fajr}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-base)',
                            color: isCurrentPrayer('dhuhr')
                              ? 'var(--color-primary)'
                              : isTodayDay
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-primary)',
                            fontWeight: isCurrentPrayer('dhuhr')
                              ? 'var(--font-weight-bold)'
                              : isTodayDay
                              ? 'var(--font-weight-semibold)'
                              : 'normal',
                            backgroundColor: isCurrentPrayer('dhuhr')
                              ? 'var(--color-primary-container-low-opacity)'
                              : 'transparent',
                            borderRadius: isCurrentPrayer('dhuhr') ? 'var(--radius-sm)' : '0',
                          }}
                        >
                          {day.dhuhr}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-base)',
                            color: isCurrentPrayer('asr')
                              ? 'var(--color-primary)'
                              : isTodayDay
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-primary)',
                            fontWeight: isCurrentPrayer('asr')
                              ? 'var(--font-weight-bold)'
                              : isTodayDay
                              ? 'var(--font-weight-semibold)'
                              : 'normal',
                            backgroundColor: isCurrentPrayer('asr')
                              ? 'var(--color-primary-container-low-opacity)'
                              : 'transparent',
                            borderRadius: isCurrentPrayer('asr') ? 'var(--radius-sm)' : '0',
                          }}
                        >
                          {day.asr}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-primary)',
                            fontWeight: isTodayDay ? 'var(--font-weight-semibold)' : 'normal',
                          }}
                        >
                          {day.sunset_makruh}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-base)',
                            color: isCurrentPrayer('maghrib')
                              ? 'var(--color-primary)'
                              : isTodayDay
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-primary)',
                            fontWeight: isCurrentPrayer('maghrib')
                              ? 'var(--font-weight-bold)'
                              : isTodayDay
                              ? 'var(--font-weight-semibold)'
                              : 'normal',
                            backgroundColor: isCurrentPrayer('maghrib')
                              ? 'var(--color-primary-container-low-opacity)'
                              : 'transparent',
                            borderRadius: isCurrentPrayer('maghrib') ? 'var(--radius-sm)' : '0',
                          }}
                        >
                          {day.maghrib}
                        </td>
                        <td
                          style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            fontSize: 'var(--font-size-base)',
                            color: isCurrentPrayer('isha')
                              ? 'var(--color-primary)'
                              : isTodayDay
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-primary)',
                            fontWeight: isCurrentPrayer('isha')
                              ? 'var(--font-weight-bold)'
                              : isTodayDay
                              ? 'var(--font-weight-semibold)'
                              : 'normal',
                            backgroundColor: isCurrentPrayer('isha')
                              ? 'var(--color-primary-container-low-opacity)'
                              : 'transparent',
                            borderRadius: isCurrentPrayer('isha') ? 'var(--radius-sm)' : '0',
                          }}
                        >
                          {day.isha}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {/* Info Note */}
          {!isLoading && !error && (
            <section
              style={{
                marginTop: 'var(--spacing-xl)',
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-surface-variant)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-outline)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              <h3 style={{ 
                color: 'var(--color-text-primary)', 
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--spacing-md)',
              }}>
                Эзоҳ дар бораи вақтҳои намоз
              </h3>
              <p style={{ marginBottom: 'var(--spacing-md)' }}>
                Тақвими вақтҳои намоз мувофиқ ба шаҳри Душанбе гирифта шудааст. Барои шаҳрҳои дигари Тоҷикистон лутфан тафовутҳои зеринро дар назар гиред:
              </p>
              
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h4 style={{ 
                  color: 'var(--color-text-primary)', 
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  Шаҳру ноҳияҳое, ки вақти онҳо пеш аз вақти шаҳри Душанбе аст:
                </h4>
                <p>
                  Истаравшан - 1 дақиқа, Кӯлоб - 4 дақиқа, Хуҷанд - 3 дақиқа, Рашт - 6 дақиқа, Конибодом - 6 дақиқа, Исфара - 7 дақиқа, Ашт - 6 дақиқа, Хоруғ - 11 дақиқа, Мурғоб - 20 дақиқа, Ҳамадонӣ - 3 дақиқа, Ш. Шоҳин - 5 дақиқа, Муминобод - 5 дақиқа.
                </p>
              </div>
              
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h4 style={{ 
                  color: 'var(--color-text-primary)', 
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  Шаҳру ноҳияҳое, ки вақти онҳо баъд аз вақти шаҳри Душанбе аст:
                </h4>
                <p>
                  Бохтар - 4 дақиқа, Панҷакент - 5 дақиқа, Шаҳритус - 3 дақиқа, Айнӣ - 1 дақиқа, Н. Хусрав - 4 дақиқа, Турсунзода - 3 дақиқа.
                </p>
              </div>
              
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Манбаъ:</strong>{' '}
                <a
                  href="https://shuroiulamo.tj/tj/namaz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Маркази исломии Ҷумҳурии Тоҷикистон
                </a>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
