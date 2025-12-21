
import React, { useState, useEffect, useCallback } from 'react';
import { Deck, AutoPlayLanguage } from '../types';
import WordCard from './WordCard';
import { playTap } from '../services/audio';
import { Play, Pause, SkipForward, SkipBack, X } from 'lucide-react';

interface FlashPlayerProps {
  deck: Deck;
  intervalSeconds: number;
  autoPlayLanguage: AutoPlayLanguage;
  onExit: () => void;
}

const FlashPlayer: React.FC<FlashPlayerProps> = ({ deck, intervalSeconds, autoPlayLanguage, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [flashKey, setFlashKey] = useState(0);

  const DURATION = intervalSeconds * 1000;

  // Memoize navigation functions
  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % deck.words.length);
    setProgress(0);
  }, [deck.words.length]);

  const prevCard = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + deck.words.length) % deck.words.length);
    setProgress(0);
  }, [deck.words.length]);

  const manualNext = () => {
    playTap();
    nextCard();
  }

  const manualPrev = () => {
    playTap();
    prevCard();
  }

  const togglePlay = () => {
    playTap();
    setIsPlaying(!isPlaying);
  };

  const handleExit = () => {
    playTap();
    onExit();
  }

  // Flash effect trigger
  useEffect(() => {
    setFlashKey(k => k + 1);
  }, [currentIndex]);

  // Unified Timer Logic
  // This replaces the separate setTimeout (trigger) and setInterval (progress) 
  // with a single loop that checks elapsed time against DURATION.
  useEffect(() => {
    let timeoutId: number;

    if (isPlaying) {
      // Calculate start time. 
      // If we just navigated, progress is 0, so startTime = Date.now().
      // If we are resuming from pause, progress is >0, so startTime is shifted back.
      const startTime = Date.now() - progress;

      const tick = () => {
        const now = Date.now();
        const elapsed = now - startTime;

        if (elapsed >= DURATION) {
          // Time completed -> Next Card
          nextCard();
        } else {
          // Still running -> Update progress and schedule next tick
          setProgress(elapsed);
          timeoutId = window.setTimeout(tick, 50);
        }
      };

      // Start the loop
      timeoutId = window.setTimeout(tick, 50);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // Dependencies: 
    // - isPlaying: toggling starts/stops loop
    // - currentIndex: changing card resets the loop (because nextCard sets progress to 0)
    // - DURATION: if settings change
    // - nextCard: stable reference
    // Note: 'progress' is NOT a dependency to avoid infinite re-renders. 
    // We only capture the initial 'progress' value when the effect mounts (pause/play or card change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex, DURATION, nextCard]);

  const progressPercent = Math.min((progress / DURATION) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#1E1B24] flex flex-col animate-enter">
      
      {/* Flash Overlay */}
      <div 
        key={flashKey} 
        className="absolute inset-0 bg-white z-[100] pointer-events-none opacity-0 animate-flash" 
      />

      {/* Header - Integrated into the white background */}
      <div className="flex-none px-6 py-6 flex justify-between items-center z-10 relative">
        <div className="px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400">
           {currentIndex + 1} / {deck.words.length}
        </div>
        <button 
          onClick={handleExit}
          className="p-3 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors active:scale-90"
        >
          <X className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
      </div>

      {/* Main Content Area - Full width/height available */}
      <div className="flex-1 relative w-full overflow-hidden">
           {deck.words.map((word, idx) => (
             <WordCard 
               key={word.id} 
               word={word} 
               isActive={idx === currentIndex}
               autoPlayLanguage={autoPlayLanguage}
             />
           ))}
      </div>

      {/* Bottom Controls Area */}
      <div className="flex-none pb-12 pt-4 px-8 relative z-10">
         
         {/* Progress Indicator */}
         <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-10">
            <div 
              className="h-full bg-m3-primary transition-all duration-[50ms] ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
         </div>

         <div className="flex items-center justify-between max-w-[280px] mx-auto">
            <button 
              onClick={manualPrev}
              className="p-4 rounded-full text-gray-400 hover:text-m3-primary hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-colors active:scale-90"
            >
              <SkipBack className="w-8 h-8 fill-current" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="
                w-20 h-20 rounded-[28px] 
                bg-m3-primary text-white 
                shadow-lg shadow-pink-500/30 
                flex items-center justify-center 
                hover:scale-105 active:scale-95 transition-all duration-300 ease-emphasized
              "
            >
              {isPlaying ? <Pause className="w-9 h-9 fill-current" /> : <Play className="w-9 h-9 fill-current ml-1" />}
            </button>

            <button 
              onClick={manualNext}
              className="p-4 rounded-full text-gray-400 hover:text-m3-primary hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-colors active:scale-90"
            >
              <SkipForward className="w-8 h-8 fill-current" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default FlashPlayer;
