'use client';

import { useEffect } from 'react';
import { SettingsService } from '@/lib/services/settings-service';

/**
 * Theme Initializer Component
 * Applies the saved theme on page load
 */
export default function ThemeInitializer() {
  useEffect(() => {
    // Apply theme on mount
    const settingsService = SettingsService.getInstance();
    const settings = settingsService.getSettings();
    
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, []);

  return null; // This component doesn't render anything
}

