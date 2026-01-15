import { QaidaModule } from '@/lib/types/qaida';
import { loadJson } from '@/lib/utils/data-loader';

export async function getQaidaModule(): Promise<QaidaModule> {
  const data = await loadJson<QaidaModule>('qaida_baghdadi.json');
  return data;
}

