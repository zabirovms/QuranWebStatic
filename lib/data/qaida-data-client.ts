'use client';

import { QaidaModule } from '@/lib/types/qaida';
import { loadJson } from '@/lib/utils/data-loader-client';

export async function getQaidaModuleClient(): Promise<QaidaModule> {
  const data = await loadJson<QaidaModule>('qaida_baghdadi.json');
  return data;
}

