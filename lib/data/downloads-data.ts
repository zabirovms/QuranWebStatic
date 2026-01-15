export interface BookFile {
  path: string;
  name: string;
  category: string;
  subcategory: string;
  extension: string;
}

const LIST_URL = 'https://cdn.quran.tj/kitobkhona/list';

// Religion & Spirituality folder prefix to filter
const RELIGION_SPIRITUALITY_PREFIX = '03_Religion_Spirituality/';

/**
 * Fetch and parse Islamic books from CDN
 * This function can be called at build time for static generation
 * Also works in client-side for refresh functionality
 */
export async function getIslamicBooks(): Promise<BookFile[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    };

    // Only add cache option in Node.js environment (build time)
    if (typeof window === 'undefined') {
      fetchOptions.cache = 'force-cache';
    }

    const response = await fetch(LIST_URL, fetchOptions);

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const allFiles: string[] = await response.json();

    // Filter all files from Religion & Spirituality category
    const religionFiles = allFiles.filter(file => 
      file.startsWith(RELIGION_SPIRITUALITY_PREFIX)
    );

    // Parse files into structured data
    const parsedBooks: BookFile[] = religionFiles.map(file => {
      const parts = file.split('/');
      const fileName = parts[parts.length - 1];
      const category = parts[0] || '';
      let subcategory = parts[1] || '';
      
      // Translate category names to Tajik
      const categoryTranslations: Record<string, string> = {
        'Islamic_Studies': 'Омӯзиши Ислом',
        'Quran_Hadith': 'Қуръон ва Ҳадис',
        'Spiritual_Growth': 'Рушди Рӯҳонӣ',
        'Biography_Memoir': 'Таърихи Ҳаёт',
        'History': 'Таърих',
      };
      
      subcategory = categoryTranslations[subcategory] || subcategory;
      
      // Remove file extension for display name
      const displayName = fileName.replace(/\.(pdf|fb2|htm|djvu)$/i, '');
      
      // Get file extension
      const fileExtension = fileName.match(/\.(pdf|fb2|htm|djvu)$/i)?.[1] || 'pdf';

      return {
        path: file,
        name: displayName,
        category,
        subcategory,
        extension: fileExtension,
      };
    });

    // Sort by name
    parsedBooks.sort((a, b) => a.name.localeCompare(b.name));

    return parsedBooks;
  } catch (error) {
    console.error('Error fetching books:', error);
    // Return empty array on error - page will still render
    return [];
  }
}
