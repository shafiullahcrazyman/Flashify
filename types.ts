
export interface JapaneseWord {
  kanji: string;
  kana: string;
}

export interface Word {
  id: string;
  en: string; // English
  bn: string; // Bengali
  jp: JapaneseWord; // Japanese
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  words: Word[];
}

export interface ImportJsonFormat {
  title?: string;
  words: {
    en: string;
    bn: string;
    jp: {
      kanji: string;
      kana: string;
    };
  }[];
}

export type AppView = 'home' | 'import' | 'play' | 'settings';

export type ThemeMode = 'system' | 'light' | 'dark';

export type AutoPlayLanguage = 'en' | 'jp' | 'bn' | 'none';

export interface AppSettings {
  theme: ThemeMode;
  interval: number; // seconds
  animationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  autoPlayLanguage: AutoPlayLanguage;
}
