/**
 * Converts a filename or text string into a clean, URL-safe slug.
 * Retains Tajik/Cyrillic letters (using \p{L}) and numbers (using \p{N}) for SEO.
 */
export function slugify(text: string): string {
  if (!text) return '';

  // Extract name without extension if it has one (e.g., "Image.jpg" -> "Image")
  let cleanText = text;
  if (text.includes('.')) {
    const parts = text.split('.');
    // If it's a typical file extension (2-4 chars), slice it off
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (lastPart.length >= 2 && lastPart.length <= 4) {
      cleanText = parts.slice(0, -1).join('.');
    }
  }

  return cleanText
    .toLowerCase()
    // Replace sequences of non-letter/non-number characters with a single hyphen
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}
