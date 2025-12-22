
import { Deck, Word, AppSettings } from '../types';

const STORAGE_KEY_DECKS = 'flash_app_decks';
const STORAGE_KEY_SETTINGS = 'flash_app_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  interval: 5,
  animationsEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
  autoPlayLanguage: 'none'
};

export const getDecks = (): Deck[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_DECKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load decks', e);
    return [];
  }
};

export const saveDeck = (deck: Deck): void => {
  const decks = getDecks();
  // Check if updating or new
  const existingIndex = decks.findIndex(d => d.id === deck.id);
  if (existingIndex >= 0) {
    decks[existingIndex] = deck;
  } else {
    decks.unshift(deck);
  }
  localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
};

export const deleteDeck = (deckId: string): void => {
  const decks = getDecks().filter(d => d.id !== deckId);
  localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    // Merge with defaults to handle new fields for existing users
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Helper to validate import format
export const validateImportJson = (json: any): boolean => {
  if (!json || !Array.isArray(json.words)) return false;
  return json.words.every((w: any) => 
    typeof w.en === 'string' &&
    typeof w.bn === 'string' &&
    w.jp &&
    typeof w.jp.kanji === 'string' &&
    typeof w.jp.kana === 'string'
  );
};
