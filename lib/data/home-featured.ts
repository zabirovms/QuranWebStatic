import { getAllDuas } from '@/lib/data/dua-data';
import { getAllTasbeehs } from '@/lib/data/tasbeeh-data';
import { getAllQuotedVerses } from '@/lib/data/quoted-verse-data';
import { getAllAsmaulHusna } from '@/lib/data/asmaul-husna-data';
import { getProphetSummaries } from '@/lib/data/prophet-data';
import { getAllLiveStreams } from '@/lib/data/live-stream-data';
import { getAllSurahs } from '@/lib/data/surah-data';

export async function getHomeFeaturedContent() {
  const [
    duas,
    tasbeehs,
    quotedVerses,
    asmaulHusna,
    prophets,
    liveStreams,
    allSurahs,
  ] = await Promise.all([
    getAllDuas(),
    getAllTasbeehs(),
    getAllQuotedVerses(),
    getAllAsmaulHusna(),
    getProphetSummaries(),
    getAllLiveStreams(),
    getAllSurahs(),
  ]);

  const displayDuas = duas.length > 0 ? duas.slice(0, 5) : [];
  const displayTasbeehs = tasbeehs.length > 0 ? tasbeehs.slice(0, 5) : [];
  const displayQuotedVerses = quotedVerses.length > 0 ? quotedVerses.slice(0, 5) : [];
  const displayAsmaulHusna = asmaulHusna.length > 0 ? asmaulHusna.slice(0, 10) : [];

  // Featured prophets: Muhammad, Ibrahim, Musa, Isa, Nuh, Yusuf, Dawood, Sulayman
  const featuredProphetNames = [
    'Муҳаммад',
    'Иброҳим',
    'Мусо',
    'Исо',
    'Нӯҳ',
    'Юсуф',
    'Довуд',
    'Сулаймон',
  ];

  const featuredProphets = prophets
    .filter((p) => featuredProphetNames.some((name) => p.name.includes(name)))
    .slice(0, 8);

  return {
    displayDuas,
    displayTasbeehs,
    displayQuotedVerses,
    displayAsmaulHusna,
    featuredProphets,
    liveStreams,
    allSurahs,
  };
}

