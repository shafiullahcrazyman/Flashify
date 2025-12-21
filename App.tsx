
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import DeckList from './components/DeckList';
import ImportWizard from './components/ImportWizard';
import FlashPlayer from './components/FlashPlayer';
import Settings from './components/Settings';
import { getDecks, getSettings, saveSettings } from './services/storage';
import { Deck, AppSettings } from './types';

// Wrapper component to handle navigation logic properly within Router context
const AppContent: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const navigate = useNavigate();

  const loadDecks = () => {
    setDecks(getDecks());
  };

  useEffect(() => {
    loadDecks();
  }, []);

  // Theme & Animation effect
  useEffect(() => {
    const applySettings = () => {
      const root = window.document.documentElement;
      const body = window.document.body;

      // Theme
      const isDark = 
        settings.theme === 'dark' || 
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Animations
      if (!settings.animationsEnabled) {
        body.classList.add('disable-animations');
      } else {
        body.classList.remove('disable-animations');
      }
    };

    applySettings();

    // Listener for system changes if system mode is active
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applySettings();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme, settings.animationsEnabled]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelectDeck = (deck: Deck) => {
    setActiveDeck(deck);
    navigate('/play');
  };

  const handleCreateComplete = () => {
    loadDecks();
    navigate('/');
  };

  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Routes>
        <Route 
          path="/" 
          element={
            <DeckList 
              decks={decks} 
              onSelectDeck={handleSelectDeck} 
              onCreateNew={() => navigate('/import')}
              onRefresh={loadDecks}
              onOpenSettings={() => navigate('/settings')}
              animationsEnabled={settings.animationsEnabled}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Settings 
              settings={settings}
              onUpdate={handleUpdateSettings}
              onBack={() => navigate('/')}
            />
          } 
        />
        <Route 
          path="/import" 
          element={
            <ImportWizard 
              onBack={() => navigate('/')} 
              onComplete={handleCreateComplete} 
            />
          } 
        />
        <Route 
          path="/play" 
          element={
            activeDeck ? (
              <FlashPlayer 
                deck={activeDeck} 
                intervalSeconds={settings.interval}
                autoPlayLanguage={settings.autoPlayLanguage}
                onExit={() => {
                  setActiveDeck(null);
                  navigate('/');
                }} 
              />
            ) : (
              // Redirect if accessed directly without state
              <div className="flex items-center justify-center min-h-screen dark:text-white">
                 <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">Return Home</button>
              </div>
            )
          } 
        />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
