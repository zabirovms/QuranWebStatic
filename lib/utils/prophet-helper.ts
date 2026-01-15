/**
 * Helper functions for prophet-related utilities
 */

/**
 * Get the SVG asset path for a prophet based on their name
 */
export function getProphetSvgPath(prophetName: string): string | null {
  if (prophetName.includes('Муҳаммад') || prophetName.includes('Muhammad')) {
    return '/images/Prophet_Muhammad_SAW.svg';
  } else if (prophetName.includes('Одам') || prophetName.includes('Adam')) {
    return '/images/Prophet_Adam_A.svg';
  } else if (prophetName.includes('Идрис') || prophetName.includes('Idris')) {
    return '/images/Prophet_Idris_A.svg';
  } else if (prophetName.includes('Нӯҳ') ||
      prophetName.includes('Nooh') ||
      prophetName.includes('Nuh') ||
      prophetName.includes('Нуҳ')) {
    return '/images/Prophet_Nooh_A.svg';
  } else if (prophetName.includes('Ҳуд') ||
      prophetName.includes('Hood') ||
      prophetName.includes('Hud')) {
    return '/images/Prophet_Hood_A.svg';
  } else if (prophetName.includes('Солеҳ') ||
      prophetName.includes('Saleh') ||
      prophetName.includes('Salih')) {
    return '/images/Prophet_Saleh_A.svg';
  } else if (prophetName.includes('Иброҳим') ||
      prophetName.includes('Ibrahim') ||
      prophetName.includes('Abraham')) {
    return '/images/Prophet_Ibrahim_A.svg';
  } else if (prophetName.includes('Лут') ||
      prophetName.includes('Loot') ||
      prophetName.includes('Lot')) {
    return '/images/Prophet_Loot_A.svg';
  } else if (prophetName.includes('Исмоил') ||
      prophetName.includes('Ismail') ||
      prophetName.includes('Ishmael')) {
    return '/images/Prophet_Ismail_A.svg';
  } else if (prophetName.includes('Исҳоқ') ||
      prophetName.includes('Ishaq') ||
      prophetName.includes('Isaac')) {
    return '/images/Prophet_Ishaq_A.svg';
  } else if (prophetName.includes('Яъқуб') ||
      prophetName.includes('Yaqoob') ||
      prophetName.includes('Jacob')) {
    return '/images/Prophet_Yaqoob_A.svg';
  } else if (prophetName.includes('Юсуф') ||
      prophetName.includes('Yusuf') ||
      prophetName.includes('Joseph')) {
    return '/images/Prophet_Yusuf_A.svg';
  } else if (prophetName.includes('Шуайб') ||
      prophetName.includes('Shuayb') ||
      prophetName.includes('Shuaib')) {
    return '/images/Prophet_Shuayb_A.svg';
  } else if (prophetName.includes('Айюб') ||
      prophetName.includes('Ayub') ||
      prophetName.includes('Ayyub') ||
      prophetName.includes('Job')) {
    return '/images/Prophet_Ayub_A.svg';
  } else if (prophetName.includes('Зулкифл') ||
      prophetName.includes('Zoolkifl') ||
      prophetName.includes('Dhul-Kifl')) {
    return '/images/Prophet_Zoolkifl_A.svg';
  } else if (prophetName.includes('Мусо') ||
      prophetName.includes('Musa') ||
      prophetName.includes('Moses')) {
    return '/images/Prophet_Musa_A.svg';
  } else if (prophetName.includes('Ҳорун') ||
      prophetName.includes('Haroon') ||
      prophetName.includes('Aaron')) {
    return '/images/Prophet_Haroon_A.svg';
  } else if (prophetName.includes('Довуд') ||
      prophetName.includes('Dawood') ||
      prophetName.includes('David')) {
    return '/images/Prophet_Dawood_A.svg';
  } else if (prophetName.includes('Сулаймон') ||
      prophetName.includes('Sulayman') ||
      prophetName.includes('Solomon')) {
    return '/images/Prophet_Sulayman_A.svg';
  } else if (prophetName.includes('Илёс') ||
      prophetName.includes('Ilyas') ||
      prophetName.includes('Elijah')) {
    return '/images/Prophet_Ilyas_A.svg';
  } else if (prophetName.includes('Юнус') ||
      prophetName.includes('Yunus') ||
      prophetName.includes('Jonah')) {
    return '/images/Prophet_Yunus_A.svg';
  } else if (prophetName.includes('Закариё') ||
      prophetName.includes('Zakariya') ||
      prophetName.includes('Zechariah')) {
    return '/images/Prophet_Zakariya_A.svg';
  } else if (prophetName.includes('Яҳё') ||
      prophetName.includes('Yahya') ||
      prophetName.includes('John')) {
    return '/images/Prophet_Yahya_A.svg';
  } else if (prophetName.includes('Исо') ||
      prophetName.includes('Isa') ||
      prophetName.includes('Jesus')) {
    return '/images/Prophet_Isa_A.svg';
  } else if (prophetName.includes('Алясаъ') ||
      prophetName.includes('Alyasa') ||
      prophetName.includes('Al-Yasa') ||
      prophetName.includes('Elisha')) {
    return '/images/Prophet_Alyasa_A.svg';
  }
  return null;
}

/**
 * Get the theme color for a prophet based on their name
 * Returns the circle color from their SVG
 */
export function getProphetThemeColor(prophetName: string): string | null {
  if (prophetName.includes('Муҳаммад') || prophetName.includes('Muhammad')) {
    return '#003366'; // Dark blue
  } else if (prophetName.includes('Одам') || prophetName.includes('Adam')) {
    return '#D18F3F'; // Brown/orange
  } else if (prophetName.includes('Идрис') || prophetName.includes('Idris')) {
    return '#331800'; // Dark brown
  } else if (prophetName.includes('Нӯҳ') ||
      prophetName.includes('Nooh') ||
      prophetName.includes('Nuh') ||
      prophetName.includes('Нуҳ')) {
    return '#4B961A'; // Green
  } else if (prophetName.includes('Ҳуд') ||
      prophetName.includes('Hood') ||
      prophetName.includes('Hud')) {
    return '#111111'; // Dark gray/black
  } else if (prophetName.includes('Солеҳ') ||
      prophetName.includes('Saleh') ||
      prophetName.includes('Salih')) {
    return '#1800AD'; // Blue
  } else if (prophetName.includes('Иброҳим') ||
      prophetName.includes('Ibrahim') ||
      prophetName.includes('Abraham')) {
    return '#17320B'; // Dark green
  } else if (prophetName.includes('Лут') ||
      prophetName.includes('Loot') ||
      prophetName.includes('Lot')) {
    return '#525151'; // Gray
  } else if (prophetName.includes('Исмоил') ||
      prophetName.includes('Ismail') ||
      prophetName.includes('Ishmael')) {
    return '#9D78A4'; // Purple
  } else if (prophetName.includes('Исҳоқ') ||
      prophetName.includes('Ishaq') ||
      prophetName.includes('Isaac')) {
    return '#B73434'; // Red
  } else if (prophetName.includes('Яъқуб') ||
      prophetName.includes('Yaqoob') ||
      prophetName.includes('Jacob')) {
    return '#0CC0DF'; // Cyan/light blue
  } else if (prophetName.includes('Юсуф') ||
      prophetName.includes('Yusuf') ||
      prophetName.includes('Joseph')) {
    return '#401268'; // Dark purple
  } else if (prophetName.includes('Шуайб') ||
      prophetName.includes('Shuayb') ||
      prophetName.includes('Shuaib')) {
    return '#FF2828'; // Red
  } else if (prophetName.includes('Айюб') ||
      prophetName.includes('Ayub') ||
      prophetName.includes('Ayyub') ||
      prophetName.includes('Job')) {
    return '#2E6417'; // Dark green
  } else if (prophetName.includes('Зулкифл') ||
      prophetName.includes('Zoolkifl') ||
      prophetName.includes('Dhul-Kifl')) {
    return '#6B1FAD'; // Purple
  } else if (prophetName.includes('Мусо') ||
      prophetName.includes('Musa') ||
      prophetName.includes('Moses')) {
    return '#5CA3FF'; // Light blue
  } else if (prophetName.includes('Ҳорун') ||
      prophetName.includes('Haroon') ||
      prophetName.includes('Aaron')) {
    return '#1F48FF'; // Blue
  } else if (prophetName.includes('Довуд') ||
      prophetName.includes('Dawood') ||
      prophetName.includes('David')) {
    return '#FF66C4'; // Pink
  } else if (prophetName.includes('Сулаймон') ||
      prophetName.includes('Sulayman') ||
      prophetName.includes('Solomon')) {
    return '#FFD21F'; // Yellow
  } else if (prophetName.includes('Илёс') ||
      prophetName.includes('Ilyas') ||
      prophetName.includes('Elijah')) {
    return '#7A2F00'; // Brown
  } else if (prophetName.includes('Юнус') ||
      prophetName.includes('Yunus') ||
      prophetName.includes('Jonah')) {
    return '#233D00'; // Dark green
  } else if (prophetName.includes('Закариё') ||
      prophetName.includes('Zakariya') ||
      prophetName.includes('Zechariah')) {
    return '#001B3D'; // Very dark blue
  } else if (prophetName.includes('Яҳё') ||
      prophetName.includes('Yahya') ||
      prophetName.includes('John')) {
    return '#004E7A'; // Dark blue
  } else if (prophetName.includes('Исо') ||
      prophetName.includes('Isa') ||
      prophetName.includes('Jesus')) {
    return '#10BB82'; // Teal/green
  } else if (prophetName.includes('Алясаъ') ||
      prophetName.includes('Alyasa') ||
      prophetName.includes('Al-Yasa') ||
      prophetName.includes('Elisha')) {
    return '#001B3D'; // Very dark blue
  }
  return null;
}

