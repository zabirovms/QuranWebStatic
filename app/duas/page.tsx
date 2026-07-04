import { getAllDuas, getAllProphetsDuas } from '@/lib/data/dua-data';
import { getDuaCategoryBySlug } from '@/lib/data/dua-categories-data';
import DuasPageClient from './page-client';

/**
 * Server component that fetches data at build time for all 9 categories.
 */
export default async function DuasPage() {
  const [
    rabbanoDuas,
    prophetsDuas,
    etiquette,
    praise,
    prayerDuas,
    seekingRefuge,
    morningAdhkar,
    eveningAdhkar,
    ruqya
  ] = await Promise.all([
    getAllDuas(),
    getAllProphetsDuas(),
    getDuaCategoryBySlug('etiquette-of-supplication'),
    getDuaCategoryBySlug('praise-and-glorification'),
    getDuaCategoryBySlug('duas-in-prayer'),
    getDuaCategoryBySlug('seeking-refuge'),
    getDuaCategoryBySlug('morning-adhkar'),
    getDuaCategoryBySlug('evening-adhkar'),
    getDuaCategoryBySlug('ruqya-healing')
  ]);

  const uniqueProphets = new Set(prophetsDuas.map(dua => dua.prophet).filter(Boolean));

  // Catalog configuration with counts loaded at build-time
  const categories = [
    {
      slug: 'etiquette-of-supplication',
      title: etiquette?.category_name_tajik || 'Одоби дуо',
      description: 'Одоб ва суннатҳои дуо кардан. Бо таҳорат будан, рӯ ба қибла кардан, ҳамду сано ва зикрҳо.',
      icon: '💡',
      count: etiquette?.total || 0,
      accentIndex: 0
    },
    {
      slug: 'praise-and-glorification',
      title: praise?.category_name_tajik || 'Ҳамду тасбеҳ',
      description: 'Дуоҳои ҳамду сано ва тасбеҳи Парвардигор. Зикрҳои бузурги савоб ва шоистаи иҷобат.',
      icon: '📿',
      count: praise?.total || 0,
      accentIndex: 1
    },
    {
      slug: 'rabbano',
      title: 'Дуоҳо аз Қуръон (Раббано)',
      description: 'Дуоҳое, ки ба калимаи "Раббано" оғоз мешаванд. Ин дуоҳо дар Қуръони Карим омадаанд ва бузургтарин дуоҳо мебошанд.',
      icon: '📖',
      count: rabbanoDuas.length,
      accentIndex: 2,
      customRoute: '/duas/rabbano'
    },
    {
      slug: 'duas-in-prayer',
      title: prayerDuas?.category_name_tajik || 'Дуоҳо дар намоз',
      description: 'Зикру дуоҳое, ки дар намоз ва пас аз намоз хонда мешаванд. Оятҳо ва дуоҳои суннат.',
      icon: '🕌',
      count: prayerDuas?.total || 0,
      accentIndex: 3
    },
    {
      slug: 'prophets',
      title: 'Дуоҳои набавӣ',
      description: 'Дуоҳои паёмбарони Аллоҳ дар Қуръони Карим. Дуоҳои Муҳаммад (с), Иброҳим, Мусо, Исо ва дигар паёмбарон.',
      icon: '🌙',
      count: prophetsDuas.length,
      accentIndex: 4,
      customRoute: '/duas/prophets'
    },
    {
      slug: 'seeking-refuge',
      title: seekingRefuge?.category_name_tajik || 'Паноҳҷӯӣ',
      description: 'Дуоҳо барои паноҳ бурдан ба Аллоҳ аз шарри шайтон, бадиҳо, танбалӣ, тарсу ваҳм ва офатҳо.',
      icon: '🛡️',
      count: seekingRefuge?.total || 0,
      accentIndex: 5
    },
    {
      slug: 'morning-adhkar',
      title: morningAdhkar?.category_name_tajik || 'Зикрҳои субҳ',
      description: 'Зикру дуоҳое, ки хондани онҳо дар субҳ тавсия дода шудааст. Ҳифзу баракат барои рӯзи шумо.',
      icon: '🌅',
      count: morningAdhkar?.total || 0,
      accentIndex: 0
    },
    {
      slug: 'evening-adhkar',
      title: eveningAdhkar?.category_name_tajik || 'Зикрҳои шом',
      description: 'Зикру дуоҳое, ки хондани онҳо дар шом ва пеш аз хоб тавсия шудааст. Паноҳгоҳи шабона.',
      icon: '🌇',
      count: eveningAdhkar?.total || 0,
      accentIndex: 1
    },
    {
      slug: 'ruqya-healing',
      title: ruqya?.category_name_tajik || 'Руқя ва шифо',
      description: 'Оятҳо ва дуоҳои руқяи шаръӣ барои шифои дардҳо, ҳифз аз чашми бад ва ҳасад.',
      icon: '🌿',
      count: ruqya?.total || 0,
      accentIndex: 2
    }
  ];

  return (
    <DuasPageClient
      categories={categories}
      rabbanoCount={rabbanoDuas.length}
      prophetsCount={prophetsDuas.length}
      uniqueProphetsCount={uniqueProphets.size}
    />
  );
}
