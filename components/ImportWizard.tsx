
import React, { useState } from 'react';
import { ImportJsonFormat } from '../types';
import { generateId, saveDeck, validateImportJson } from '../services/storage';
import { playTap, playSuccess, playError } from '../services/audio';
import { ArrowLeft, Copy, Save, AlertCircle, Check, Sparkles } from 'lucide-react';

interface ImportWizardProps {
  onBack: () => void;
  onComplete: () => void;
}

const AI_PROMPT = `Generate a JSON object for a flashcard based word learning app.

IMPORTANT OUTPUT RULES:
1) First, output ONLY the JSON data.
2) Format it exactly as JSON and wrap it in a triple-backtick code block labeled json so it’s ready to copy.
3) After the JSON code block ends, output a separate section called "Deck Suggestions".
4) The "Deck Suggestions" section must NOT be inside the JSON.
5) The JSON must remain valid and unchanged.

APP CONTEXT:
Flashfy is a word learning app.
Do NOT generate sentences, phrases, examples, or explanations.
Generate ONLY individual words.

JSON FORMAT:
{
  "title": "Topic Name",
  "words": [
    {
      "en": "English word",
      "bn": "Bangla word",
      "jp": {
        "kanji": "Kanji or empty if none",
        "kana": "Kana reading"
      }
    }
  ]
}

WORD RULES:
• Include ONLY individual words.
• Do NOT include sentences or example usage.
• Keep words simple, common, and learner friendly.
• Japanese words must be in dictionary form.
• If a Japanese word has kanji, include it.
• If a Japanese word has no kanji, leave "kanji" empty ("").
• Kana must be hiragana or katakana as appropriate.

CONTENT RULES:
• The "words" array must contain 5–10 words only.
• Do NOT exceed 10 words.
• Do NOT include fewer than 5 words.
• The title must clearly describe the topic.
• Output only valid JSON inside the code block.

After the JSON block, include:

Deck Suggestions:
• Suggest exactly 5 new flashcard deck topics.
• Each suggestion must focus on word learning only.
• Each topic must be different.
• Keep suggestions short and clear.
• Do NOT include JSON in this section.
• Do NOT repeat the topic used in the JSON.`;

const ImportWizard: React.FC<ImportWizardProps> = ({ onBack, onComplete }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedWords, setParsedWords] = useState<ImportJsonFormat['words'] | null>(null);
  const [deckTitle, setDeckTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleBack = () => {
    playTap();
    onBack();
  }

  const handleCopyPrompt = () => {
    playTap();
    navigator.clipboard.writeText(AI_PROMPT);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleParse = () => {
    playTap();
    try {
      const parsed = JSON.parse(jsonInput);
      if (validateImportJson(parsed)) {
        setParsedWords(parsed.words);
        if (parsed.title && typeof parsed.title === 'string') {
          setDeckTitle(parsed.title);
        }
        setError(null);
        playSuccess();
      } else {
        setError('Invalid format. Please ensure JSON matches the strict schema.');
        playError();
      }
    } catch (e) {
      setError('Invalid JSON syntax. Check for missing brackets.');
      playError();
    }
  };

  const handleCreateDeck = () => {
    if (!parsedWords || !deckTitle.trim()) return;

    playSuccess();

    const newDeck = {
      id: generateId(),
      title: deckTitle,
      createdAt: Date.now(),
      words: parsedWords.map(w => ({
        id: generateId(),
        en: w.en,
        bn: w.bn,
        jp: w.jp
      }))
    };

    saveDeck(newDeck);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-50/95 dark:bg-[#121212]/95 backdrop-blur-md px-4 py-4 flex items-center transition-all duration-300">
        <button 
          onClick={handleBack}
          className="p-2.5 -ml-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white ml-2 animate-fade-scale">New Deck</h1>
      </header>

      <div className="max-w-xl mx-auto p-5 space-y-6">
        
        {/* Step 1: Copy Prompt */}
        <section className="bg-white dark:bg-[#1E1B24] rounded-[32px] p-6 animate-enter" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-m3-primary text-sm font-bold shrink-0">1</div>
               <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Get Words</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-tight">Copy AI prompt</p>
               </div>
             </div>
             <button 
                onClick={handleCopyPrompt}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ease-emphasized shrink-0
                  ${copySuccess 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 scale-105' 
                    : 'bg-m3-primary text-white hover:brightness-110 active:scale-95 shadow-lg shadow-pink-500/30'}
                `}
             >
                {copySuccess ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copySuccess ? 'Copied' : 'Copy'}
             </button>
          </div>
        </section>

        {/* Step 2: Paste */}
        <section className="bg-white dark:bg-[#1E1B24] rounded-[32px] p-6 animate-enter" style={{ animationDelay: '100ms' }}>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-m3-primary text-sm font-bold shrink-0">2</div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Paste JSON</h2>
           </div>
           
           <div className="relative">
             <textarea
               value={jsonInput}
               onChange={(e) => setJsonInput(e.target.value)}
               placeholder='Paste result here...'
               className="w-full h-40 p-4 rounded-2xl bg-gray-50 dark:bg-[#121212] focus:ring-1 focus:ring-m3-primary outline-none text-sm font-mono resize-none transition-all duration-300 text-gray-800 dark:text-gray-200 placeholder-gray-400"
             />
           </div>
           
           {error && (
            <div className="mt-3 text-red-500 text-sm flex items-center gap-2 px-1 font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
           )}

           <button
             onClick={handleParse}
             disabled={!jsonInput.trim()}
             className="mt-4 w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
           >
             <Sparkles className="w-4 h-4" />
             Parse Words
           </button>
        </section>

        {/* Step 3: Review */}
        <div className={`transition-all duration-500 ease-emphasized ${parsedWords ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-8 pointer-events-none blur-sm'}`}>
           <section className="bg-white dark:bg-[#1E1B24] rounded-[32px] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-m3-primary text-sm font-bold shrink-0">3</div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Finalize</h2>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Deck Title</label>
                <input 
                  type="text" 
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  className="block w-full px-4 py-3 bg-gray-50 dark:bg-[#121212] rounded-2xl focus:ring-1 focus:ring-m3-primary outline-none text-gray-900 dark:text-white font-medium transition-all"
                  placeholder="e.g. Animals, Travel..."
                />
              </div>

              <div className="space-y-2 mb-8 max-h-[240px] overflow-y-auto pr-1">
                {parsedWords?.map((w, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-[#121212] rounded-2xl animate-enter" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1E1B24] flex items-center justify-center text-xs font-bold text-gray-400">
                      {i + 1}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{w.en}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                         <span className="text-emerald-600 dark:text-emerald-400">{w.bn}</span>
                         <span className="text-gray-300">•</span>
                         <span className="text-sky-600 dark:text-sky-400">{w.jp.kanji}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleCreateDeck}
                disabled={!parsedWords || !deckTitle.trim()}
                className="w-full py-4 bg-m3-primary text-white rounded-[20px] font-bold text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
              >
                <Save className="w-5 h-5" />
                Create Deck
              </button>
           </section>
        </div>

      </div>
    </div>
  );
};

export default ImportWizard;
