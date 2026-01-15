/**
 * Tajik Search Utility
 * Handles fuzzy search with Tajik character variations
 * Supports Russian keyboard input (х→ҳ, к→қ, ж→ҷ, etc.)
 */

// Russian keyboard to Tajik character mapping
// When users type on Russian keyboard, these characters should match Tajik equivalents
const RUSSIAN_TO_TAJIK: Record<string, string> = {
  // Lowercase
  'х': 'ҳ',  // Russian х → Tajik ҳ
  'к': 'қ',  // Russian к → Tajik қ
  'ж': 'ҷ',  // Russian ж → Tajik ҷ
  'и': 'ӣ',  // Russian и → Tajik ӣ
  'у': 'ӯ',  // Russian у → Tajik ӯ
  'г': 'ғ',  // Russian г → Tajik ғ
  // Uppercase
  'Х': 'Ҳ',
  'К': 'Қ',
  'Ж': 'Ҷ',
  'И': 'Ӣ',
  'У': 'Ӯ',
  'Г': 'Ғ',
};

// Normalization map: both Tajik and Russian characters map to same normalized form
// This allows "хач" (Russian) to match "ҳаҷ" (Tajik) because both normalize to "haj"
const NORMALIZE_MAP: Record<string, string> = {
  // Tajik characters → normalized form (lowercase)
  'ҳ': 'h',
  'қ': 'q',
  'ҷ': 'j',  // Tajik ҷ → j
  'ӣ': 'i',
  'ӯ': 'u',
  'ғ': 'g',
  // Tajik uppercase → same normalized form
  'Ҳ': 'h',
  'Қ': 'q',
  'Ҷ': 'j',
  'Ӣ': 'i',
  'Ӯ': 'u',
  'Ғ': 'g',
  // Russian keyboard characters → same normalized form as Tajik
  // Key feature: Russian "х" normalizes to "h" just like Tajik "ҳ"
  // So "хач" (Russian) will match "ҳаҷ" (Tajik)
  'х': 'h',  // Russian х → same as Tajik ҳ
  'к': 'q',  // Russian к → same as Tajik қ
  'ж': 'j',  // Russian ж → same as Tajik ҷ
  'и': 'i',  // Russian и → same as Tajik ӣ
  'у': 'u',  // Russian у → same as Tajik ӯ
  'г': 'g',  // Russian г → same as Tajik ғ
  'ч': 'j',  // Russian ч → treated as equivalent to Tajik ҷ (for fuzzy matching)
  // Russian uppercase → same normalized form
  'Х': 'h',
  'К': 'q',
  'Ж': 'j',
  'И': 'i',
  'У': 'u',
  'Г': 'g',
  'Ч': 'j',
};

/**
 * Normalize text for search by converting both Tajik and Russian characters
 * to a common normalized form for matching
 * 
 * Example: "хач" (Russian) and "ҳаҷ" (Tajik) both normalize to "haj"
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  
  let normalized = text.toLowerCase();
  
  // Replace both Tajik and Russian characters with normalized Latin equivalents
  // This allows "хач" (Russian) to match "ҳаҷ" (Tajik) because both normalize to "haj"
  for (const [char, normalizedChar] of Object.entries(NORMALIZE_MAP)) {
    normalized = normalized.replace(new RegExp(char, 'g'), normalizedChar);
  }
  
  return normalized.trim();
}

/**
 * Check if search query matches text (fuzzy matching)
 * Handles:
 * - Tajik character variations
 * - Common typos
 * - Partial matches
 * - Case insensitivity
 */
export function fuzzyMatch(searchQuery: string, text: string): boolean {
  if (!searchQuery) return true;
  if (!text) return false;
  
  const normalizedQuery = normalizeForSearch(searchQuery);
  const normalizedText = normalizeForSearch(text);
  
  // Exact match after normalization
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }
  
  // Word-by-word matching for better results
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  const textWords = normalizedText.split(/\s+/).filter(w => w.length > 0);
  
  // Check if all query words are found in text
  return queryWords.every(queryWord => 
    textWords.some(textWord => textWord.includes(queryWord))
  );
}

/**
 * Calculate search relevance score for ranking
 * Higher score = better match
 */
export function calculateRelevance(searchQuery: string, text: string): number {
  if (!searchQuery || !text) return 0;
  
  const normalizedQuery = normalizeForSearch(searchQuery);
  const normalizedText = normalizeForSearch(text);
  
  let score = 0;
  
  // Exact match gets highest score
  if (normalizedText === normalizedQuery) {
    score += 100;
  }
  
  // Starts with query gets high score
  if (normalizedText.startsWith(normalizedQuery)) {
    score += 50;
  }
  
  // Contains query
  if (normalizedText.includes(normalizedQuery)) {
    score += 25;
  }
  
  // Word matches
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  const textWords = normalizedText.split(/\s+/).filter(w => w.length > 0);
  
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord === queryWord) {
        score += 10;
      } else if (textWord.startsWith(queryWord)) {
        score += 5;
      } else if (textWord.includes(queryWord)) {
        score += 2;
      }
    });
  });
  
  return score;
}