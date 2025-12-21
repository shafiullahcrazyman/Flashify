
import React, { useState, useEffect, useCallback } from 'react';
import { Word, AutoPlayLanguage } from '../types';
import { Volume2 } from 'lucide-react';

interface WordCardProps {
  word: Word;
  isActive: boolean;
  autoPlayLanguage?: AutoPlayLanguage;
}

const WordCard: React.FC<WordCardProps> = ({ word, isActive, autoPlayLanguage = 'none' }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availVoices = window.speechSynthesis.getVoices();
      if (availVoices.length > 0) {
        setVoices(availVoices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    }
  }, []);

  const getBestVoice = useCallback((langCode: string) => {
    const targetLang = langCode.replace('_', '-');
    const baseLang = targetLang.split('-')[0];
    
    // Filter voices that match the base language (e.g. "en")
    let candidateVoices = voices.filter(v => v.lang.replace('_', '-').startsWith(baseLang));
    
    if (candidateVoices.length === 0) return null;

    // If a specific region is requested (e.g. "en-GB"), try to narrow down to that region
    if (targetLang.includes('-')) {
      const regionMatches = candidateVoices.filter(v => 
        v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase()
      );
      if (regionMatches.length > 0) {
        candidateVoices = regionMatches;
      }
    }

    const googleVoice = candidateVoices.find(v => v.name.includes('Google'));
    if (googleVoice) return googleVoice;

    const femaleKeywords = ['female', 'samantha', 'zira', 'yuri', 'kyoko', 'kanya', 'lekha'];
    const femaleVoice = candidateVoices.find(v => 
      femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    );
    if (femaleVoice) return femaleVoice;

    return candidateVoices[0];
  }, [voices]);

  const speak = useCallback((text: string, lang: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    const voice = getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.pitch = 1.05; // Slightly clearer
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  }, [getBestVoice]);

  const handlePlayAudio = (e: React.MouseEvent, text: string, lang: string) => {
    e.stopPropagation();
    speak(text, lang);
  };

  // Auto-play effect
  useEffect(() => {
    if (isActive && autoPlayLanguage !== 'none') {
       let text = '';
       let langCode = '';
       
       switch (autoPlayLanguage) {
         case 'en':
           text = word.en;
           langCode = 'en-GB'; // Changed to British English
           break;
         case 'jp':
           text = word.jp.kanji; // Reading Kanji
           langCode = 'ja-JP';
           break;
         case 'bn':
           text = word.bn;
           langCode = 'bn-BD';
           break;
       }
       
       if (text && langCode) {
         // Using a small timeout can help ensure the UI transition has started before audio begins
         const timer = setTimeout(() => {
             speak(text, langCode);
         }, 100);
         return () => clearTimeout(timer);
       }
    }
  }, [isActive, autoPlayLanguage, word, speak]);

  return (
    <div 
      className={`
        absolute inset-0 w-full h-full
        flex flex-col justify-center px-8 gap-6 md:gap-8
        ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
      `}
    >
      {/* English Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase ml-1">English</span>
        <div className="flex justify-between items-center group">
          <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{word.en}</span>
          <button 
            onClick={(e) => handlePlayAudio(e, word.en, 'en-GB')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-orange-400 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all opacity-80 group-hover:opacity-100"
            aria-label="Play English"
          >
            <Volume2 className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      {/* Japanese Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em] text-sky-500 uppercase ml-1">Japanese</span>
        <div className="flex justify-between items-center group">
          <div>
            <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight font-jp">{word.jp.kanji}</p>
            <p className="text-base font-bold text-sky-600/70 dark:text-sky-300/70 font-jp mt-1">{word.jp.kana}</p>
          </div>
          <button 
            onClick={(e) => handlePlayAudio(e, word.jp.kanji, 'ja-JP')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all opacity-80 group-hover:opacity-100"
            aria-label="Play Japanese"
          >
            <Volume2 className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      {/* Bengali Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase ml-1">Bengali</span>
        <div className="flex justify-between items-center group">
          <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-bn">{word.bn}</span>
          <button 
            onClick={(e) => handlePlayAudio(e, word.bn, 'bn-BD')}
            className="w-12 h-12 rounded-full flex items-center justify-center text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all opacity-80 group-hover:opacity-100"
            aria-label="Play Bengali"
          >
            <Volume2 className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default WordCard;
