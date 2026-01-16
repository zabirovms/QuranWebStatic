'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { prayerTimesService } from '@/lib/services/prayer-times-service';
import type { PrayerTime, PrayerDay } from '@/lib/types/prayer-times';
import SectionLink from './SectionLink';

export default function PrayerTimesSection() {
  const [todayPrayerTimes, setTodayPrayerTimes] = useState<PrayerTime | null>(null);
  const [todayFullData, setTodayFullData] = useState<PrayerDay | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPrayerTimes = async () => {
      try {
        const today = await prayerTimesService.getTodayPrayerTimes();
        setTodayPrayerTimes(today);

        // Get today's full data
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const monthFileName = prayerTimesService.getMonthFileName(year, month);
        const fullData = await prayerTimesService.fetchFullMonthData(monthFileName);
        const todayNum = new Date().getDate();
        const todayData = fullData.days.find((day) => {
          const dayNum = parseInt(day.gregorian.split('.')[0]);
          return dayNum === todayNum;
        });
        setTodayFullData(todayData || null);
      } catch (err) {
        console.error('Failed to load prayer times:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrayerTimes();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentPrayer = () => {
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
        
        if (endTimeMinutes < startTimeMinutes) {
          endTimeMinutes += 24 * 60;
        }

        if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
          return prayer.key;
        }
      }
    }
    return null;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  if (isLoading) {
    return (
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--elevation-2)',
          border: '1px solid var(--color-outline)',
        }}>
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Боргирӣ...
          </div>
        </div>
      </div>
    );
  }

  if (!todayPrayerTimes || !todayFullData) {
    return null;
  }

  const currentPrayer = getCurrentPrayer();

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--elevation-2)',
        border: '1px solid var(--color-outline)',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            margin: 0,
            color: 'var(--color-text-primary)',
          }}>
            Вақтҳои намоз
          </h2>
          <SectionLink href="/vaqti-namoz">
            <span>ҳама</span>
            <span>→</span>
          </SectionLink>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}>
          {[
            { key: 'fajr', name: 'Бомдод', time: todayFullData.fajr },
            { key: 'dhuhr', name: 'Пешин', time: todayFullData.dhuhr },
            { key: 'asr', name: 'Аср', time: todayFullData.asr },
            { key: 'maghrib', name: 'Шом', time: todayFullData.maghrib },
            { key: 'isha', name: 'Хуфтан', time: todayFullData.isha },
          ].map((prayer) => {
            const isUpcoming = currentPrayer === prayer.key;
            const timeParts = prayer.time.split(' - ');
            const startTime = timeParts[0];

            return (
              <Link
                key={prayer.key}
                href="/vaqti-namoz"
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: isUpcoming
                    ? 'var(--color-primary)'
                    : 'var(--color-primary-container-low-opacity)',
                  borderRadius: 'var(--radius-md)',
                  border: isUpcoming ? '2px solid var(--color-primary)' : '1px solid var(--color-outline)',
                  boxShadow: isUpcoming ? 'var(--elevation-2)' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isUpcoming) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--elevation-2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUpcoming) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: isUpcoming
                    ? 'var(--color-on-primary)'
                    : 'var(--color-text-secondary)',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}>
                  {prayer.name}
                  {isUpcoming && (
                    <span style={{
                      display: 'block',
                      fontSize: 'var(--font-size-xs)',
                      marginTop: '4px',
                    }}>
                      (Ҷорӣ)
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'bold',
                  color: isUpcoming ? 'var(--color-on-primary)' : 'var(--color-primary)',
                }}>
                  {startTime}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
