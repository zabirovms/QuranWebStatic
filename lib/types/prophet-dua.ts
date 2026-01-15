export interface ProphetDuaReference {
  surah: number;
  verses: number[];
}

export interface ProphetDua {
  name: string;
  arabicName?: string;
  references: ProphetDuaReference[];
}

