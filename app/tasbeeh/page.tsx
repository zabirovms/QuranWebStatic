import { getAllTasbeehs } from '@/lib/data/tasbeeh-data';
import TasbeehPageClient from '@/components/TasbeehPageClient';

export default async function TasbeehPage() {
  const tasbeehs = await getAllTasbeehs();
  return <TasbeehPageClient tasbeehs={tasbeehs} />;
}

