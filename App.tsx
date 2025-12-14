import React, { useState, useMemo, useEffect } from 'react';
import { SHORTCUTS } from './constants';
import { Category, Platform, AppView } from './types';
import { ShortcutCard } from './components/ShortcutCard';
import { GuideView } from './components/GuideView';
import { PracticeView, PracticeMode } from './components/PracticeView'; // New modular practice container
import { KeyCap } from './components/KeyCap';
import { Search, Keyboard, Book, ArrowLeft, SlidersHorizontal, ArrowRight, Zap, Database, Sun, Moon, X, Filter, BookMarked, GraduationCap, CheckCircle, Terminal, Target } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [platform, setPlatform] = useState<Platform>(Platform.WINDOWS);
  const [isDark, setIsDark] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [practiceStartMode, setPracticeStartMode] = useState<PracticeMode>('hub');
  
  // Initialize bookmarks from localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('keymaster_bookmarks');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  // Initialize mastered IDs from localStorage
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('keymaster_mastered');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('keymaster_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Persist mastered IDs
  useEffect(() => {
    localStorage.setItem('keymaster_mastered', JSON.stringify(masteredIds));
  }, [masteredIds]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
        prev.includes(id) 
            ? prev.filter(i => i !== id) 
            : [...prev, id]
    );
  };

  const addBookmarks = (ids: string[]) => {
    setBookmarkedIds(prev => {
        const newIds = ids.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
    });
  };

  const markMastered = (ids: string | string[]) => {
      const idsToMark = Array.isArray(ids) ? ids : [ids];
      setMasteredIds(prev => {
          const newIds = idsToMark.filter(id => !prev.includes(id));
          return [...prev, ...newIds];
      });
  };

  const clearBookmarks = () => {
      if (window.confirm('Are you sure you want to clear your entire learning plan?')) {
          setBookmarkedIds([]);
          setMasteredIds([]);
      }
  };

  // --- Filtering Logic ---
  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS.filter((shortcut) => {
      // 1. Filter by Category
      if (selectedCategory !== 'All' && shortcut.category !== selectedCategory) {
        return false;
      }

      // 2. Filter by Modifiers (Control Keys)
      if (selectedModifiers.length > 0) {
        const keysToCheck = (platform === Platform.MAC && shortcut.macKeys) 
            ? shortcut.macKeys 
            : shortcut.keys;
            
        // The shortcut must contain ALL selected modifiers
        const hasAllModifiers = selectedModifiers.every(mod => 
            keysToCheck.some(k => k.toLowerCase() === mod.toLowerCase())
        );

        if (!hasAllModifiers) return false;
      }
      
      // 3. Filter by Search Query
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      const matchDescription = shortcut.description.toLowerCase().includes(query);
      const matchCategory = shortcut.category.toLowerCase().includes(query);
      const matchNote = shortcut.note?.toLowerCase().includes(query);
      const matchKeys = shortcut.keys.some(k => k.toLowerCase().includes(query));
      const matchMacKeys = shortcut.macKeys?.some(k => k.toLowerCase().includes(query));

      return matchDescription || matchCategory || matchNote || matchKeys || matchMacKeys;
    });
  }, [searchQuery, selectedCategory, selectedModifiers, platform]);

  const categories = ['All', ...Object.values(Category)];

  const toggleModifier = (mod: string) => {
    setSelectedModifiers(prev => 
        prev.includes(mod) 
            ? prev.filter(m => m !== mod) 
            : [...prev, mod]
    );
  };

  const currentModifiers = platform === Platform.WINDOWS 
    ? ['Ctrl', 'Alt', 'Shift', 'Win']
    : ['Cmd', 'Option', 'Shift', 'Ctrl'];

  // --- Render Views ---

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div 
                className="flex items-center gap-3 cursor-pointer group shrink-0"
                onClick={() => setView('landing')}
            >
                <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                    <Keyboard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                    KeyMaster
                </h1>
            </div>
          
            {/* Header Search Bar */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
                {view !== 'practice' && (
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-sm"
                            placeholder="Search shortcuts..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value && view !== 'search') setView('search');
                            }}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {view !== 'landing' && (
                    <button 
                        onClick={() => setView('landing')}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium mr-2"
                    >
                       <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
                    </button>
                )}

                <button 
                    onClick={() => setView('search')}
                    className={`
                        relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium mr-1
                        ${view === 'search'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }
                    `}
                >
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">Shortcuts</span>
                </button>

                <button 
                    onClick={() => setView('guide')}
                    className={`
                        relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium mr-1
                        ${view === 'guide'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }
                    `}
                >
                    <Book className="w-4 h-4" />
                    <span className="hidden sm:inline">Guide</span>
                </button>

                <button 
                    onClick={() => {
                        setPracticeStartMode('hub');
                        setView('practice');
                    }}
                    className={`
                        relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium
                        ${view === 'practice'
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }
                    `}
                >
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Practice</span>
                    {bookmarkedIds.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                            {bookmarkedIds.length}
                        </span>
                    )}
                </button>
                
                {view === 'search' && (
                     <button 
                        onClick={() => {
                            setPlatform(platform === Platform.WINDOWS ? Platform.MAC : Platform.WINDOWS);
                            setSelectedModifiers([]); // Clear modifiers when switching platform
                        }}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                     >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {platform === Platform.WINDOWS ? 'Win' : 'Mac'}
                     </button>
                )}

                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    </header>
  );

  const renderLanding = () => (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl -z-10"></div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              New: Text Editing Simulator
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 max-w-4xl">
              Master your keyboard, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">master your workflow.</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
              Keyboard shortcuts are like idioms in a foreign language. 
              Unlock the full potential of your computer with our interactive database and comprehensive learning guide.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center justify-center">
              <button 
                  id="browse-btn"
                  onClick={() => setView('search')}
                  className="w-full md:w-auto group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20 dark:shadow-indigo-900/20"
              >
                  <Database className="w-5 h-5" />
                  Browse Database
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                  onClick={() => {
                      setPracticeStartMode('hub');
                      setView('practice');
                  }}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                  <Target className="w-5 h-5 text-indigo-500" />
                  Start Practicing
              </button>

              <button 
                    onClick={() => {
                        setPracticeStartMode('test');
                        setView('practice');
                    }}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                    <Zap className="w-5 h-5" />
                    Test Skills
                </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800/50 pt-10">
              <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mb-2">
                      <Zap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Speed Up</h3>
                  <p className="text-sm text-slate-500">Perform complex actions in milliseconds without touching your mouse.</p>
              </div>
              <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mb-2">
                      <GraduationCap className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Personal Plan</h3>
                  <p className="text-sm text-slate-500">Bookmark useful shortcuts to create a custom curriculum for yourself.</p>
              </div>
              <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center mb-2">
                      <Terminal className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Interactive Simulator</h3>
                  <p className="text-sm text-slate-500">Practice text selection, indentation, and outlining in a real editor environment.</p>
              </div>
          </div>
      </div>
  );

  const renderSearch = () => (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* --- Search & Filters --- */}
        <div className="sticky top-20 z-40 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm py-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:static transition-colors duration-300">
          <div className="flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Search Input - Hidden on MD up because it's in header, shown on mobile */}
                <div className="relative w-full md:w-96 group md:hidden">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                    placeholder="Search shortcuts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
                </div>

                {/* Mobile Platform Toggle */}
                <div className="flex sm:hidden w-full justify-between items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button 
                        onClick={() => {
                            setPlatform(Platform.WINDOWS);
                            setSelectedModifiers([]);
                        }}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md text-center transition-all ${platform === Platform.WINDOWS ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Windows
                    </button>
                    <button 
                        onClick={() => {
                            setPlatform(Platform.MAC);
                            setSelectedModifiers([]);
                        }}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md text-center transition-all ${platform === Platform.MAC ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        macOS
                    </button>
                </div>

                {/* Category Chips */}
                <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <div className="flex space-x-2">
                    {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat as Category | 'All')}
                        className={`
                        whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                        ${selectedCategory === cat 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/40' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'}
                        `}
                    >
                        {cat}
                    </button>
                    ))}
                </div>
                </div>
            </div>

            {/* Modifier Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Control Keys:</span>
                </div>
                <div className="flex items-center gap-2">
                    {currentModifiers.map((mod) => (
                        <button
                            key={mod}
                            onClick={() => toggleModifier(mod)}
                            className={`
                                group relative transition-all duration-200 rounded-lg outline-none
                                ${selectedModifiers.includes(mod) 
                                    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950 scale-105' 
                                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                                }
                            `}
                        >
                            <KeyCap 
                                label={mod} 
                                size="sm" 
                                variant={selectedModifiers.includes(mod) ? 'modifier' : 'default'} 
                                className="cursor-pointer"
                            />
                        </button>
                    ))}
                    
                    {selectedModifiers.length > 0 && (
                         <button
                            onClick={() => setSelectedModifiers([])}
                            className="ml-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* --- Results Grid --- */}
        {filteredShortcuts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-20">
            {filteredShortcuts.map((shortcut) => (
              <ShortcutCard 
                key={shortcut.id} 
                shortcut={shortcut} 
                activePlatform={platform} 
                isBookmarked={bookmarkedIds.includes(shortcut.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-slate-300">No shortcuts found</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, categories, or modifier filters.
            </p>
            <button 
                onClick={() => {setSearchQuery(''); setSelectedCategory('All'); setSelectedModifiers([]);}}
                className="mt-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm hover:underline"
            >
                Clear all filters
            </button>
          </div>
        )}
      </div>
  );

  return (
    <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
        
        {renderHeader()}

        <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {view === 'landing' && renderLanding()}
            {view === 'search' && renderSearch()}
            {view === 'guide' && <GuideView />}
            {view === 'practice' && (
                <PracticeView 
                    bookmarkedIds={bookmarkedIds}
                    masteredIds={masteredIds}
                    platform={platform}
                    onPlatformChange={setPlatform}
                    addBookmarks={addBookmarks}
                    onMarkMastered={(id) => markMastered(id)}
                    onClearAll={clearBookmarks}
                    initialMode={practiceStartMode}
                />
            )}
        </main>

        {/* --- Footer --- */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 transition-colors duration-300 print:hidden">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-slate-500 text-sm font-medium">
                    KeyMaster - Semantic Keyboard Shortcut Database
                </p>
                <div className="mt-4 flex flex-col items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                        Developed by <a href="https://dominiklukes.net" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors">Dominik Lukeš</a>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span>License: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 dark:decoration-slate-600 hover:decoration-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">CC BY 4.0</a></span>
                    </div>
                </div>
            </div>
        </footer>
        </div>
    </div>
  );
};

export default App;