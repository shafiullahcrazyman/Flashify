
import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { deleteDeck } from '../services/storage';
import { playTap, playDelete, playSuccess } from '../services/audio';
import { Trash2, Plus, Settings as SettingsIcon, ChevronRight, X } from 'lucide-react';

interface DeckListProps {
  decks: Deck[];
  onSelectDeck: (deck: Deck) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  animationsEnabled?: boolean;
}

const DeckList: React.FC<DeckListProps> = ({ 
  decks, 
  onSelectDeck, 
  onCreateNew, 
  onRefresh, 
  onOpenSettings,
  animationsEnabled = true
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Auto-reset delete confirmation after 3 seconds
  useEffect(() => {
    if (deleteId) {
      const timer = setTimeout(() => {
        setDeleteId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteId]);

  const handleCreate = () => {
    playTap();
    onCreateNew();
  }

  const handleSettings = () => {
    playTap();
    onOpenSettings();
  }

  const handleDeckClick = (deck: Deck) => {
    playTap();
    onSelectDeck(deck);
  }

  const handleDelete = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    // Critical: Stop propagation immediately to prevent opening the deck
    e.stopPropagation();
    e.preventDefault();
    
    if (deleteId === id) {
      // Confirmed - Delete now
      playDelete();
      deleteDeck(id);
      setDeleteId(null);
      onRefresh();
    } else {
      // First click - Wait for confirmation
      playTap();
      setDeleteId(id);
    }
  };

  const cancelDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playTap();
    setDeleteId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-gray-50/95 dark:bg-[#121212]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-m3-primary tracking-tighter animate-fade-scale">Flashify</span>
        </div>
        <button 
          onClick={handleSettings}
          className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-90 duration-200"
          aria-label="Settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="p-5 max-w-2xl mx-auto space-y-4">
        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-enter">
             <div className="w-20 h-20 bg-white dark:bg-[#1E1B24] rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                <Plus className="w-8 h-8 text-m3-primary/60" />
             </div>
             <p className="text-xl font-medium text-gray-900 dark:text-white">No decks yet</p>
             <p className="text-gray-500 dark:text-gray-400 mt-2">Tap the pink button to create one</p>
          </div>
        ) : (
          decks.map((deck, index) => (
            <div 
              key={deck.id}
              className={`relative group bg-white dark:bg-[#1E1B24] rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 ease-emphasized overflow-hidden isolate ${animationsEnabled ? 'animate-enter' : ''}`}
              style={{ 
                animationDelay: animationsEnabled ? `${index * 50}ms` : '0ms', 
                opacity: animationsEnabled ? 0 : 1 
              }} 
            >
              {/* 
                  Layer 1: Navigation Target
              */}
              <button
                onClick={() => handleDeckClick(deck)}
                className="absolute inset-0 w-full h-full z-0 text-left outline-none focus:bg-pink-50 dark:focus:bg-pink-500/10 active:bg-pink-100 dark:active:bg-pink-500/20 transition-colors cursor-pointer appearance-none border-none bg-transparent"
                type="button"
                aria-label={`Open ${deck.title}`}
              />

              {/* 
                  Layer 2: Visual Content
              */}
              <div className="relative z-10 flex items-center p-5 pointer-events-none">
                 
                 {/* Count Badge */}
                 <div className="h-14 w-14 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0 mr-5 transition-transform group-hover:scale-105 duration-500 ease-emphasized">
                    <span className="font-bold text-lg text-m3-primary">{deck.words.length}</span>
                 </div>
                 
                 {/* Text Info */}
                 <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-m3-primary transition-colors duration-300">
                      {deck.title}
                    </h3>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(deck.createdAt).toLocaleDateString()}
                    </p>
                 </div>

                 {/* 
                    Layer 3: Action Area 
                 */}
                 <div 
                    className="pointer-events-auto ml-2 flex items-center z-20"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                 >
                    {deleteId === deck.id ? (
                      <div className="flex items-center gap-1 animate-fade-scale">
                         <button
                           onClick={(e) => handleDelete(e, deck.id)}
                           className="p-3 rounded-full bg-m3-primary text-white shadow-lg shadow-pink-500/30 hover:brightness-110 transition-all active:scale-95 duration-200"
                         >
                           <Trash2 className="w-5 h-5 fill-current" />
                         </button>
                         <button
                           onClick={(e) => cancelDelete(e, deck.id)}
                           className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 transition-all active:scale-95 duration-200"
                         >
                           <X className="w-4 h-4" />
                         </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleDelete(e, deck.id)}
                          className="p-3 rounded-full text-gray-300 hover:text-m3-primary hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 active:scale-90"
                          title="Delete Deck"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="pr-2 text-gray-300 dark:text-gray-600 group-hover:translate-x-1 transition-transform duration-300 ease-emphasized">
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* FAB */}
      <button 
        onClick={handleCreate}
        className="
          fixed bottom-8 right-6 
          w-16 h-16 
          bg-m3-primary text-white 
          rounded-[20px] 
          shadow-[0_8px_30px_rgb(236,64,122,0.3)] 
          flex items-center justify-center 
          hover:scale-105 active:scale-95 
          transition-all duration-300 ease-emphasized z-40
          animate-enter
        "
        aria-label="Create New Deck"
        style={{ animationDelay: '0.3s' }}
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default DeckList;
