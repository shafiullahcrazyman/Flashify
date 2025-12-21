
import React from 'react';
import { ArrowLeft, Monitor, Moon, Sun, Timer, Zap, Volume2, Smartphone, Languages } from 'lucide-react';
import { AppSettings, ThemeMode, AutoPlayLanguage } from '../types';
import { playTap, playToggle } from '../services/audio';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onBack }) => {

  const handleThemeChange = (mode: ThemeMode) => {
    playToggle(true);
    onUpdate({ ...settings, theme: mode });
  };

  const handleAutoPlayChange = (lang: AutoPlayLanguage) => {
    // If clicking the currently selected one, toggle it off
    const newValue = settings.autoPlayLanguage === lang ? 'none' : lang;
    playToggle(newValue !== 'none');
    onUpdate({ ...settings, autoPlayLanguage: newValue });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...settings, interval: parseInt(e.target.value, 10) });
  };
  
  const toggleSetting = (key: keyof Pick<AppSettings, 'animationsEnabled' | 'soundEnabled' | 'hapticsEnabled'>) => {
    const newValue = !settings[key];
    playToggle(newValue);
    onUpdate({ ...settings, [key]: newValue });
  };
  
  const handleBack = () => {
    playTap();
    onBack();
  }

  const OptionBox = ({ 
    icon: Icon, 
    label, 
    isSelected,
    onClick
  }: { 
    icon: any, 
    label: string, 
    isSelected: boolean,
    onClick: () => void
  }) => {
    return (
      <button 
        onClick={onClick}
        className={`
          flex flex-col items-center justify-center p-4 rounded-[24px] transition-all duration-300 ease-emphasized gap-3
          ${isSelected 
            ? 'bg-m3-primary text-white shadow-lg shadow-pink-500/20 scale-105' 
            : 'bg-white dark:bg-[#1E1B24] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95'}
        `}
      >
        <Icon className={`w-6 h-6 ${isSelected ? 'fill-current' : ''}`} />
        <span className="font-bold text-sm">{label}</span>
      </button>
    );
  };

  const ToggleRow = ({ 
    icon: Icon, 
    label, 
    value, 
    onChange 
  }: { 
    icon: any, 
    label: string, 
    value: boolean, 
    onChange: () => void 
  }) => {
    return (
      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1E1B24] rounded-[24px] transition-colors">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${value ? 'bg-pink-50 dark:bg-pink-500/10 text-m3-primary' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">{label}</span>
        </div>
        <button 
          onClick={onChange}
          className={`
            w-14 h-8 rounded-full relative transition-colors duration-300 ease-emphasized
            ${value ? 'bg-m3-primary' : 'bg-gray-300 dark:bg-gray-700'}
          `}
        >
          <div className={`
            absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-emphasized
            ${value ? 'translate-x-6' : 'translate-x-0'}
          `} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] pb-10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-50/95 dark:bg-[#121212]/95 backdrop-blur-md px-4 py-4 flex items-center transition-all duration-300">
        <button 
          onClick={handleBack}
          className="p-2.5 -ml-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white ml-2 animate-fade-scale">Settings</h1>
      </header>

      <div className="max-w-xl mx-auto p-5 space-y-8 animate-enter">
        
        {/* Appearance Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Appearance</h2>
          <div className="grid grid-cols-3 gap-3">
            <OptionBox 
              icon={Monitor} 
              label="System" 
              isSelected={settings.theme === 'system'} 
              onClick={() => handleThemeChange('system')}
            />
            <OptionBox 
              icon={Sun} 
              label="Light" 
              isSelected={settings.theme === 'light'}
              onClick={() => handleThemeChange('light')}
            />
            <OptionBox 
              icon={Moon} 
              label="Dark" 
              isSelected={settings.theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
            />
          </div>
        </section>

        {/* Auto Pronunciation Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Auto Pronunciation</h2>
          <div className="grid grid-cols-3 gap-3">
            <OptionBox 
              icon={Languages} 
              label="English" 
              isSelected={settings.autoPlayLanguage === 'en'} 
              onClick={() => handleAutoPlayChange('en')}
            />
            <OptionBox 
              icon={Languages} 
              label="Japanese" 
              isSelected={settings.autoPlayLanguage === 'jp'}
              onClick={() => handleAutoPlayChange('jp')}
            />
            <OptionBox 
              icon={Languages} 
              label="Bengali" 
              isSelected={settings.autoPlayLanguage === 'bn'}
              onClick={() => handleAutoPlayChange('bn')}
            />
          </div>
        </section>

        {/* Experience Section */}
        <section className="space-y-3">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Experience</h2>
           <ToggleRow 
             icon={Volume2} 
             label="Sound Effects" 
             value={settings.soundEnabled} 
             onChange={() => toggleSetting('soundEnabled')} 
           />
           <ToggleRow 
             icon={Smartphone} 
             label="Haptics" 
             value={settings.hapticsEnabled} 
             onChange={() => toggleSetting('hapticsEnabled')} 
           />
           <ToggleRow 
             icon={Zap} 
             label="Animations" 
             value={settings.animationsEnabled} 
             onChange={() => toggleSetting('animationsEnabled')} 
           />
        </section>

        {/* Playback Section */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Speed</h2>
          <div className="bg-white dark:bg-[#1E1B24] rounded-[32px] p-6 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-full text-m3-primary">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-white block">
                  {settings.interval} seconds
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Duration per card
                </span>
              </div>
            </div>
            
            <div className="px-2">
              <input 
                type="range" 
                min="3" 
                max="20" 
                step="1" 
                value={settings.interval}
                onChange={handleIntervalChange}
                className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-m3-primary hover:accent-pink-600 transition-colors"
              />
              <div className="flex justify-between mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Fast (3s)</span>
                <span>Slow (20s)</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;
