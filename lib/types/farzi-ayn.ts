export interface FarziAynVerseItem {
  transliteration: string;
  translation: string;
}

export interface FarziAynQnaItem {
  question: string;
  answer: string;
}

export interface FarziAynParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface FarziAynListBlock {
  type: 'list';
  listItems: string[];
}

export interface FarziAynPoetryBlock {
  type: 'poetry';
  lines: string[];
}

export interface FarziAynArabicVerseBlock {
  type: 'arabic_verse';
  verses: FarziAynVerseItem[];
}

export interface FarziAynQnaBlock {
  type: 'qna';
  qnaItems: FarziAynQnaItem[];
}

export type FarziAynContentBlock = 
  | FarziAynParagraphBlock 
  | FarziAynListBlock 
  | FarziAynPoetryBlock 
  | FarziAynArabicVerseBlock 
  | FarziAynQnaBlock;

export interface FarziAynSection {
  id: string;
  title: string;
  category: string;
  content: FarziAynContentBlock[];
}
