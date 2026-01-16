'use client';

import { useEffect, useRef } from 'react';
import type { PrayerDay } from '@/lib/types/prayer-times';

interface PrayerTimesStructuredDataProps {
  todayData?: PrayerDay | null;
  location?: string;
  currentDate?: Date;
}

export default function PrayerTimesStructuredData({
  todayData,
  location = 'Душанбе',
  currentDate = new Date(),
}: PrayerTimesStructuredDataProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !todayData) return;
    
    isMountedRef.current = true;

    // Remove existing structured data script
    try {
      if (scriptRef.current && scriptRef.current.isConnected) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
      
      const existingScript = document.querySelector('script[type="application/ld+json"][data-seo="prayer-times"]');
      if (existingScript && existingScript.isConnected && existingScript !== scriptRef.current) {
        existingScript.remove();
      }
    } catch (error) {
      console.warn('Error removing structured data script:', error);
    }

    const baseUrl = 'https://www.quran.tj';
    
    // Extract prayer times
    const parseTime = (timeStr: string) => {
      const parts = timeStr.split(' - ');
      return parts[0] || timeStr;
    };

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${baseUrl}/vaqti-namoz`,
      name: `Вақтҳои намоз дар ${location} - Время намаза в Душанбе`,
      description: `Вақтҳои намоз барои шаҳрҳои Тоҷикистон. Тақвими комили вақтҳои намоз барои ҳар рӯз.`,
      url: `${baseUrl}/vaqti-namoz`,
      inLanguage: 'tg',
      about: {
        '@type': 'Thing',
        name: 'Prayer Times',
        description: 'Islamic prayer times for Tajikistan',
      },
      mainEntity: {
        '@type': 'Event',
        name: `Вақтҳои намоз - ${currentDate.toLocaleDateString('tg-TJ')}`,
        startDate: currentDate.toISOString().split('T')[0],
        location: {
          '@type': 'Place',
          name: location,
          addressCountry: 'TJ',
          addressRegion: 'Dushanbe',
        },
        eventSchedule: [
          {
            '@type': 'Schedule',
            name: 'Бомдод (Fajr)',
            startTime: parseTime(todayData.fajr),
          },
          {
            '@type': 'Schedule',
            name: 'Пешин (Dhuhr)',
            startTime: parseTime(todayData.dhuhr),
          },
          {
            '@type': 'Schedule',
            name: 'Аср (Asr)',
            startTime: parseTime(todayData.asr),
          },
          {
            '@type': 'Schedule',
            name: 'Шом (Maghrib)',
            startTime: parseTime(todayData.maghrib),
          },
          {
            '@type': 'Schedule',
            name: 'Хуфтан (Isha)',
            startTime: parseTime(todayData.isha),
          },
        ],
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Асосӣ',
            item: `${baseUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Вақтҳои намоз',
            item: `${baseUrl}/vaqti-namoz`,
          },
        ],
      },
    };

    // Create and append structured data script
    try {
      if (isMountedRef.current && document.head) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'prayer-times');
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
        scriptRef.current = script;
      }
    } catch (error) {
      console.warn('Error adding structured data script:', error);
    }

    // Cleanup on unmount
    return () => {
      if (scriptRef.current && scriptRef.current.isConnected) {
        try {
          scriptRef.current.remove();
        } catch (error) {
          console.warn('Error removing structured data on cleanup:', error);
        }
      }
    };
  }, [todayData, location, currentDate]);

  return null;
}
