import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Shortcut, Platform, Category } from '../types';
import { ShortcutCard } from './ShortcutCard';
import { KeyCap } from './KeyCap';
import { 
    Trash2, 
    BookMarked, 
    Play, 
    Calendar as CalendarIcon, 
    Layout, 
    ChevronLeft, 
    ChevronRight, 
    Eye, 
    EyeOff, 
    Download, 
    CheckCircle2, 
    PackagePlus, 
    Keyboard, 
    MousePointer2, 
    X,
    Library,
    Layers,
    ArrowLeft,
    GraduationCap,
    MoreVertical,
    Trophy,
    Monitor,
    AppWindow,
    SkipForward,
    History
} from 'lucide-react';
import { SHORTCUTS, ESSENTIAL_IDS } from '../constants';

interface LearningPlanViewProps {
    bookmarkedIds: string[];
    masteredIds: string[];
    platform: Platform;
    initialTab?: 'overview' | 'flashcards'; // Keeping prop signature but mapping internally
    onPlatformChange: (platform: Platform) => void;
    onToggleBookmark: (id: string) => void;
    addBookmarks: (ids: string[]) => void;
    onMarkMastered: (id: string) => void;
    onClearAll: () => void;
}

// Data Models
interface Deck {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    icon?: React.ElementType;
    shortcuts: Shortcut[];
    color: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'blue' | 'slate' | 'rose';
    isCurated?: boolean;
}

interface CuratedPlan {
    id: string;
    title: string;
    description: string;
    ids: readonly string[];
    color: Deck['color'];
    platforms: Platform[];
}

interface LogEntry {
    id: string;
    shortcutDesc: string;
    result: 'correct' | 'skipped';
    timestamp: number;
}

const CURATED_PLANS: CuratedPlan[] = [
    {
        id: 'essentials',
        title: "The Essentials",
        description: "Must-know shortcuts for every computer user. Copy, paste, undo, and save.",
        ids: ESSENTIAL_IDS,
        color: "indigo",
        platforms: [Platform.WINDOWS, Platform.MAC]
    },
    {
        id: 'text-wizard',
        title: "Text Editing Wizard",
        description: "Edit text faster than you can type. Navigation, selection, and formatting.",
        ids: ['txt-2', 'txt-3', 'txt-4', 'txt-5', 'txt-1', 'cc-2', 'cc-5'],
        color: "emerald",
        platforms: [Platform.WINDOWS, Platform.MAC]
    },
    {
        id: 'window-manager',
        title: "Window Manager",
        description: "Control your digital workspace efficiently. Switch, snap, and show desktop.",
        ids: ['win-1', 'win-2', 'win-3', 'win-4', 'win-5', 'sys-2'],
        color: "amber",
        platforms: [Platform.WINDOWS]
    },
    {
        id: 'browser-pro',
        title: "Browser Pro",
        description: "Surf the web without the mouse. Tab management and navigation.",
        ids: ['web-2', 'web-3', 'web-4', 'web-5', 'web-1', 'web-6'],
        color: "cyan",
        platforms: [Platform.WINDOWS, Platform.MAC]
    },
    {
        id: 'outlook-power',
        title: "Outlook Power User",
        description: "Triage emails, reply, and organize your calendar without touching the mouse.",
        ids: ['out-1', 'out-2', 'out-3', 'out-4', 'out-5', 'out-6', 'out-7'],
        color: "blue",
        platforms: [Platform.WINDOWS, Platform.MAC]
    }
];

// Helper to determine if a shortcut is safe to practice via keyboard listener
const isSafeToPractice = (shortcut: Shortcut, platform: Platform): boolean => {
    const keys = (platform === Platform.MAC && shortcut.macKeys) ? shortcut.macKeys : shortcut.keys;
    if (!keys) return true;
    const keyString = keys.join('+').toLowerCase();

    // Specific disruptive keys
    if (keyString.includes('alt+tab') || keyString.includes('cmd+tab')) return false;
    if (keyString.includes('alt+f4')) return false;
    if (keyString.includes('ctrl+w') || keyString.includes('cmd+w')) return false; 
    if (keyString.includes('ctrl+n') || keyString.includes('cmd+n')) return false; 
    if (keyString.includes('ctrl+t') || keyString.includes('cmd+t')) return false; 
    if (keyString.includes('win+l')) return false; 
    if (keyString.includes('f5')) return false; 
    if (keyString.includes('f11')) return false; 
    if (keyString.includes('f12')) return false; 
    
    // Heuristics based on description
    const desc = shortcut.description.toLowerCase();
    if (desc.includes('close current application')) return false;
    if (desc.includes('switch between open applications')) return false;
    if (desc.includes('switch app')) return false;
    
    return true;
};

export const LearningPlanView: React.FC<LearningPlanViewProps> = ({
    bookmarkedIds,
    masteredIds,
    platform,
    initialTab,
    onPlatformChange,
    onToggleBookmark,
    addBookmarks,
    onMarkMastered,
    onClearAll
}) => {
    // Navigation State
    const [viewMode, setViewMode] = useState<'library' | 'deck' | 'practice'>('library');
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

    // Initial Tab Redirect (Migration)
    useEffect(() => {
        if (initialTab === 'flashcards' && bookmarkedIds.length > 0) {
            setActiveDeckId('all');
            setViewMode('practice');
        }
    }, [initialTab]); // Only run if prop changes specifically

    // Flashcard / Practice State
    const [fcIndex, setFcIndex] = useState(0);
    const [fcFlipped, setFcFlipped] = useState(false);
    const [autoPractice, setAutoPractice] = useState(true);
    const [isPracticeMode, setIsPracticeMode] = useState(true);
    const [pressedKeys, setPressedKeys] = useState<string[]>([]);
    const [practiceFeedback, setPracticeFeedback] = useState<'idle' | 'success' | 'error'>('idle');
    const [mcOptions, setMcOptions] = useState<string[][]>([]);
    const [sessionLog, setSessionLog] = useState<LogEntry[]>([]);

    // Schedule State
    const [itemsPerDay, setItemsPerDay] = useState(5);

    // --- Data Derivation ---

    // 1. Get all saved shortcut objects
    const allSavedShortcuts = useMemo(() => {
        return SHORTCUTS.filter(s => bookmarkedIds.includes(s.id));
    }, [bookmarkedIds]);

    // 2. Generate Decks
    const decks = useMemo<Deck[]>(() => {
        if (allSavedShortcuts.length === 0) return [];

        const generatedDecks: Deck[] = [];

        // Deck 1: All Shortcuts
        generatedDecks.push({
            id: 'all',
            title: 'All Bookmarks',
            subtitle: `${allSavedShortcuts.length} items`,
            description: 'Your entire collection of saved shortcuts.',
            shortcuts: allSavedShortcuts,
            color: 'indigo',
            icon: Layers
        });

        // Decks 2+: Categories
        const categories = Array.from(new Set(allSavedShortcuts.map(s => s.category))) as string[];
        categories.forEach(cat => {
            const catShortcuts = allSavedShortcuts.filter(s => s.category === cat);
            generatedDecks.push({
                id: `cat-${cat}`,
                title: cat,
                subtitle: `${catShortcuts.length} items`,
                shortcuts: catShortcuts,
                color: 'slate',
                icon: BookMarked
            });
        });

        // Decks 3+: Active Curated Plans
        CURATED_PLANS.forEach(plan => {
            const planShortcuts = SHORTCUTS.filter(s => plan.ids.includes(s.id) && bookmarkedIds.includes(s.id));
            if (planShortcuts.length > 0) {
                generatedDecks.push({
                    id: `plan-${plan.id}`,
                    title: plan.title,
                    subtitle: 'Curated Pack',
                    description: plan.description,
                    shortcuts: planShortcuts,
                    color: plan.color,
                    isCurated: true
                });
            }
        });

        return generatedDecks;
    }, [allSavedShortcuts, bookmarkedIds]);

    const activeDeck = useMemo(() => {
        return decks.find(d => d.id === activeDeckId) || decks[0];
    }, [decks, activeDeckId]);

    const activeDeckShortcuts = activeDeck?.shortcuts || [];
    const activeDeckMasteredCount = activeDeckShortcuts.filter(s => masteredIds.includes(s.id)).length;
    
    // Filter out mastered for Practice Mode
    const practiceQueue = useMemo(() => {
        return activeDeckShortcuts.filter(s => !masteredIds.includes(s.id));
    }, [activeDeckShortcuts, masteredIds]);

    // Ensure index safety
    useEffect(() => {
        if (fcIndex >= practiceQueue.length && practiceQueue.length > 0) {
            setFcIndex(0);
        }
    }, [practiceQueue.length, fcIndex]);

    const getKeysForPlatform = useCallback((s: Shortcut) => {
        return (platform === Platform.MAC && s.macKeys) ? s.macKeys : s.keys;
    }, [platform]);

    // --- Practice Mode Logic ---
    
    // Generate MC options
    useEffect(() => {
        const currentCard = practiceQueue[fcIndex];
        if (!currentCard) return;

        if (!isSafeToPractice(currentCard, platform)) {
            const correctKeys = getKeysForPlatform(currentCard);
            const otherShortcuts = SHORTCUTS.filter(s => s.id !== currentCard.id);
            const shuffled = otherShortcuts.sort(() => 0.5 - Math.random());
            
            const distractors: string[][] = [];
            for (const s of shuffled) {
                if (distractors.length >= 3) break;
                const dKeys = getKeysForPlatform(s);
                if (JSON.stringify(dKeys) !== JSON.stringify(correctKeys)) {
                    distractors.push(dKeys);
                }
            }
            const options = [correctKeys, ...distractors].sort(() => 0.5 - Math.random());
            setMcOptions(options);
        }
    }, [fcIndex, practiceQueue, platform, getKeysForPlatform]);

    // Keyboard Lock
    useEffect(() => {
        const currentCard = practiceQueue[fcIndex];
        const isSafe = currentCard ? isSafeToPractice(currentCard, platform) : true;
        const shouldLock = viewMode === 'practice' && isPracticeMode && !fcFlipped && practiceQueue.length > 0 && isSafe;

        if (shouldLock) {
            if (navigator && 'keyboard' in navigator && (navigator as any).keyboard.lock) {
                (navigator as any).keyboard.lock().catch(console.debug);
            }
        } else {
            if (navigator && 'keyboard' in navigator && (navigator as any).keyboard.unlock) {
                (navigator as any).keyboard.unlock();
            }
        }
        return () => {
            if (navigator && 'keyboard' in navigator && (navigator as any).keyboard.unlock) {
                (navigator as any).keyboard.unlock();
            }
        };
    }, [viewMode, isPracticeMode, fcFlipped, practiceQueue.length, fcIndex, platform]);

    // Input Listener
    useEffect(() => {
        if (viewMode !== 'practice' || !isPracticeMode || fcFlipped || practiceQueue.length === 0) return;
        const currentShortcut = practiceQueue[fcIndex];
        if (!currentShortcut || !isSafeToPractice(currentShortcut, platform)) return;

        const mapKey = (key: string) => {
            if (key === 'Control') return 'Ctrl';
            if (key === 'Meta') return platform === Platform.MAC ? 'Cmd' : 'Win';
            if (key === 'Alt') return platform === Platform.MAC ? 'Option' : 'Alt';
            if (key === 'Shift') return 'Shift';
            if (key === 'ArrowUp') return 'Up';
            if (key === 'ArrowDown') return 'Down';
            if (key === 'ArrowLeft') return 'Left';
            if (key === 'ArrowRight') return 'Right';
            if (key === ' ') return 'Space';
            if (key === 'Escape') return 'Esc';
            if (key.length === 1) return key.toUpperCase();
            return key;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setPressedKeys(prev => {
                const label = mapKey(e.key);
                return prev.includes(label) ? prev : [...prev, label];
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const label = mapKey(e.key);
            setPressedKeys(prev => prev.filter(k => k !== label));
            if (practiceFeedback === 'error') setPracticeFeedback('idle');
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [viewMode, isPracticeMode, fcIndex, practiceQueue, platform, fcFlipped, practiceFeedback]);

    // Input Validation
    useEffect(() => {
        if (viewMode !== 'practice' || !isPracticeMode || fcFlipped || practiceQueue.length === 0) return;
        const currentShortcut = practiceQueue[fcIndex];
        if (!currentShortcut || !isSafeToPractice(currentShortcut, platform)) return;

        const targetKeys = getKeysForPlatform(currentShortcut);

        if (pressedKeys.length > targetKeys.length) {
            setPracticeFeedback('error');
            const timer = setTimeout(() => {
                setPressedKeys([]);
                setPracticeFeedback('idle');
            }, 500);
            return () => clearTimeout(timer);
        }

        if (pressedKeys.length === targetKeys.length && pressedKeys.length > 0) {
            const isMatch = targetKeys.every(targetKey => {
                if (targetKey === 'Arrow') {
                    return pressedKeys.some(k => ['Up', 'Down', 'Left', 'Right'].includes(k));
                }
                return pressedKeys.some(k => k.toLowerCase() === targetKey.toLowerCase());
            });

            if (isMatch) {
                setPracticeFeedback('success');
                const timer = setTimeout(() => {
                    handleCorrect(currentShortcut);
                }, 800);
                return () => clearTimeout(timer);
            } else {
                setPracticeFeedback('error');
                const timer = setTimeout(() => {
                    setPressedKeys([]);
                    setPracticeFeedback('idle');
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [pressedKeys, isPracticeMode, fcIndex, practiceQueue, platform, getKeysForPlatform, fcFlipped, autoPractice, onMarkMastered, viewMode]);

    // Helpers
    const handleCorrect = (shortcut: Shortcut) => {
        // Log
        setSessionLog(prev => [{
            id: crypto.randomUUID(),
            shortcutDesc: shortcut.description,
            result: 'correct',
            timestamp: Date.now()
        }, ...prev]);

        onMarkMastered(shortcut.id);
        setPressedKeys([]);
        setPracticeFeedback('idle');
        setIsPracticeMode(autoPractice);
    };

    const handleSkip = () => {
        const currentShortcut = practiceQueue[fcIndex];
        if (!currentShortcut) return;

        setSessionLog(prev => [{
            id: crypto.randomUUID(),
            shortcutDesc: currentShortcut.description,
            result: 'skipped',
            timestamp: Date.now()
        }, ...prev]);

        // Move to next card without mastering
        setFcIndex(prev => (prev + 1) % practiceQueue.length);
        setPressedKeys([]);
        setPracticeFeedback('idle');
    };

    const handleMcClick = (selectedKeys: string[]) => {
        const currentCard = practiceQueue[fcIndex];
        const correctKeys = getKeysForPlatform(currentCard);
        if (JSON.stringify(selectedKeys) === JSON.stringify(correctKeys)) {
             setPracticeFeedback('success');
             setTimeout(() => {
                handleCorrect(currentCard);
             }, 800);
        } else {
             setPracticeFeedback('error');
             setTimeout(() => setPracticeFeedback('idle'), 500);
        }
    };

    const generateICS = () => {
        if (!activeDeck) return;
        const chunks: Shortcut[][] = [];
        // Only use NOT mastered for schedule
        const toLearn = activeDeck.shortcuts.filter(s => !masteredIds.includes(s.id));
        
        for (let i = 0; i < toLearn.length; i += itemsPerDay) {
            chunks.push(toLearn.slice(i, i + itemsPerDay));
        }

        let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//KeyMaster//Study Plan//EN\n`;
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() + 1);

        chunks.forEach((chunk, index) => {
            const eventDate = new Date(startDate);
            eventDate.setDate(eventDate.getDate() + index);
            const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('T')[0];
            
            const description = chunk.map(s => `• ${s.description}: ${getKeysForPlatform(s).join(' + ')}`).join('\\n');
            icsContent += `BEGIN:VEVENT\nDTSTART;VALUE=DATE:${dateStr}\nSUMMARY:KeyMaster: ${activeDeck.title} (Day ${index + 1})\nDESCRIPTION:${description}\nEND:VEVENT\n`;
        });
        icsContent += 'END:VCALENDAR';
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([icsContent], { type: 'text/calendar;charset=utf-8' }));
        link.setAttribute('download', 'keymaster-plan.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Views ---

    const renderLibrary = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Hero Section */}
            <div className="bg-slate-900 dark:bg-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Library className="w-5 h-5 text-indigo-300" />
                                <span className="text-indigo-200 font-medium tracking-wide text-sm uppercase">Deck Library</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">My Collections</h1>
                            <p className="text-slate-300 max-w-xl text-lg">
                                You have saved <span className="text-white font-bold">{allSavedShortcuts.length}</span> shortcuts across {decks.length - 1} categories.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPlatformChange(platform === Platform.WINDOWS ? Platform.MAC : Platform.WINDOWS)}
                                className="flex items-center gap-2 px-3 py-2 text-indigo-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium border border-white/10 backdrop-blur-sm"
                                title="Switch Platform"
                            >
                                {platform === Platform.WINDOWS ? <Monitor className="w-4 h-4" /> : <AppWindow className="w-4 h-4" />}
                                <span>{platform === Platform.WINDOWS ? 'Windows' : 'macOS'}</span>
                            </button>
                            <button 
                                onClick={onClearAll}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Clear All Bookmarks"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deck Grid */}
            <div className="mb-12">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">Your Decks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => {
                        const Icon = deck.icon || Layers;
                        const masteredCount = deck.shortcuts.filter(s => masteredIds.includes(s.id)).length;
                        const progress = Math.round((masteredCount / deck.shortcuts.length) * 100);
                        
                        // Color styles
                        const colorMap: Record<string, string> = {
                            indigo: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400',
                            emerald: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400',
                            slate: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500',
                            amber: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 hover:border-amber-400',
                            cyan: 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400',
                            blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:border-blue-400',
                            rose: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800 hover:border-rose-400',
                        };
                        const colorStyles = colorMap[deck.color] || colorMap['slate'];

                        return (
                            <div 
                                key={deck.id}
                                onClick={() => { setActiveDeckId(deck.id); setViewMode('deck'); }}
                                className={`
                                    relative group p-6 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md
                                    ${colorStyles}
                                `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${deck.color === 'slate' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                                        <Icon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{deck.shortcuts.length}</div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cards</div>
                                    </div>
                                </div>
                                
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {deck.title}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-10">
                                    {deck.description || deck.subtitle || `${deck.shortcuts.length} shortcuts to master`}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-500">
                                        <span>Mastery</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Curated Plans Section (Add More) */}
            <div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1 flex items-center gap-2">
                    <PackagePlus className="w-5 h-5 text-indigo-500" />
                    Explore Starter Packs
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CURATED_PLANS.map(plan => {
                        const addedCount = plan.ids.filter(id => bookmarkedIds.includes(id)).length;
                        const totalCount = plan.ids.length;
                        const isFullyAdded = addedCount === totalCount;
                        
                        return (
                            <div key={plan.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{plan.title}</h4>
                                    {isFullyAdded ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">{totalCount} Cards</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mb-6 flex-1">{plan.description}</p>
                                <button
                                    onClick={() => addBookmarks(plan.ids as string[])}
                                    disabled={isFullyAdded}
                                    className={`
                                        w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                                        ${isFullyAdded 
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' 
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 active:scale-95'}
                                    `}
                                >
                                    {isFullyAdded ? 'Added to Library' : 'Add Pack'}
                                </button>
                            </div>
                        );
                    })}
                 </div>
            </div>
        </div>
    );

    const renderDeckDetail = () => {
        if (!activeDeck) return null;
        const progress = Math.round((activeDeckMasteredCount / activeDeckShortcuts.length) * 100);

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8">
                    <button 
                        onClick={() => setViewMode('library')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Library
                    </button>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                    Deck
                                </span>
                                {activeDeck.isCurated && <span className="text-xs text-slate-500 font-medium">Curated Pack</span>}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{activeDeck.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span>{activeDeckShortcuts.length} cards</span>
                                <span>•</span>
                                <span>{activeDeckMasteredCount} mastered</span>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto items-center">
                            <button
                                onClick={() => onPlatformChange(platform === Platform.WINDOWS ? Platform.MAC : Platform.WINDOWS)}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                            >
                                {platform === Platform.WINDOWS ? <Monitor className="w-4 h-4" /> : <AppWindow className="w-4 h-4" />}
                                <span className="hidden sm:inline">{platform === Platform.WINDOWS ? 'Windows' : 'macOS'}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setFcIndex(0);
                                    setFcFlipped(false);
                                    setIsPracticeMode(true);
                                    setViewMode('practice');
                                    setSessionLog([]); // Clear log
                                }}
                                disabled={practiceQueue.length === 0}
                                className={`
                                    flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95
                                    ${practiceQueue.length === 0 
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}
                                `}
                            >
                                <Play className="w-5 h-5 fill-current" />
                                {practiceQueue.length === 0 ? 'Deck Mastered' : 'Practice Deck'}
                            </button>
                            
                            {/* Schedule / Actions Menu could go here */}
                        </div>
                    </div>
                </div>

                {/* Shortcuts List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-24">
                    {activeDeckShortcuts.map(shortcut => (
                        <div key={shortcut.id} className="relative group">
                            <ShortcutCard
                                shortcut={shortcut}
                                activePlatform={platform}
                                isBookmarked={true}
                                onToggleBookmark={onToggleBookmark}
                            />
                            {masteredIds.includes(shortcut.id) && (
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm z-10 animate-in zoom-in duration-300">
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderPractice = () => {
        if (!activeDeck) return null;

        // Completion State
        if (practiceQueue.length === 0) {
            return (
                <div className="max-w-xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                            <Trophy className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">Deck Complete!</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg relative z-10">
                            You've mastered all the shortcuts in <strong>{activeDeck.title}</strong>.
                        </p>
                        <button
                            onClick={() => setViewMode('deck')}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 relative z-10"
                        >
                            <Layout className="w-5 h-5" />
                            Return to Deck
                        </button>
                    </div>
                    {/* Log for completion */}
                    {sessionLog.length > 0 && (
                        <div className="mt-8">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 justify-center">
                                <History className="w-5 h-5" /> Session Summary
                            </h3>
                             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left">
                                {sessionLog.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3">
                                            {log.result === 'correct' ? (
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <SkipForward className="w-4 h-4" />
                                                </div>
                                            )}
                                            <span className="font-medium text-slate-700 dark:text-slate-200">{log.shortcutDesc}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                        </span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            );
        }

        const currentCard = practiceQueue[fcIndex];
        const keys = getKeysForPlatform(currentCard);
        const isSafe = isSafeToPractice(currentCard, platform);

        return (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setViewMode('deck')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Stop
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <div className="text-sm font-bold text-slate-400">
                            {fcIndex + 1} / {practiceQueue.length}
                        </div>
                        <button 
                            onClick={handleSkip}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Skip <SkipForward className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl min-h-[450px] flex flex-col justify-between relative overflow-hidden">
                    {/* Controls */}
                    <div className="absolute top-6 right-6 z-20">
                         <button 
                            onClick={() => {
                                setAutoPractice(!autoPractice);
                                if (!autoPractice && !fcFlipped) setIsPracticeMode(true);
                                if (autoPractice) setIsPracticeMode(false);
                            }}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                                ${autoPractice 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' 
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }
                            `}
                        >
                            <Keyboard className="w-3.5 h-3.5" />
                            <span>Interactive</span>
                            <div className={`w-2 h-2 rounded-full ${autoPractice ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${((fcIndex) / practiceQueue.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 mt-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2 block">{currentCard.category}</span>
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                {currentCard.description}
                            </h3>
                            {currentCard.note && (
                                <p className="text-slate-500 italic">{currentCard.note}</p>
                            )}
                        </div>

                        {/* Interactive Area */}
                        {isPracticeMode && !fcFlipped ? (
                             isSafe ? (
                                <div className={`
                                    w-full max-w-md p-6 rounded-2xl border-2 transition-all duration-200 relative
                                    flex flex-col items-center justify-center min-h-[140px]
                                    ${practiceFeedback === 'success' 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500' 
                                        : practiceFeedback === 'error'
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 animate-shake'
                                            : 'bg-slate-50 dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 border-dashed animate-pulse-slow'
                                    }
                                `}>
                                    {pressedKeys.length > 0 && (
                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            {pressedKeys.map((k, i) => (
                                                <React.Fragment key={i}>
                                                    <KeyCap label={k} size="md" variant={practiceFeedback === 'success' ? 'action' : 'default'} />
                                                    {i < pressedKeys.length - 1 && <span className="text-slate-400 font-bold">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )}
                                    {pressedKeys.length === 0 && <p className="text-slate-400 dark:text-slate-500 font-medium">Type the shortcut...</p>}
                                    {practiceFeedback === 'success' && <div className="mt-4 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct!</div>}
                                </div>
                             ) : (
                                 <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     {mcOptions.map((optionKeys, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleMcClick(optionKeys)}
                                            className="p-4 rounded-xl border-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-sm flex flex-wrap justify-center gap-2"
                                        >
                                            {optionKeys.map((k, i) => (
                                                <React.Fragment key={i}>
                                                    <KeyCap label={k} size="sm" />
                                                    {i < optionKeys.length - 1 && <span className="text-slate-300 font-bold">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </button>
                                     ))}
                                 </div>
                             )
                        ) : (
                            <div className={`transition-all duration-300 ${fcFlipped ? 'opacity-100' : 'opacity-0'}`}>
                                {fcFlipped && (
                                    <div className="flex flex-wrap items-center justify-center gap-2 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        {keys.map((k, i) => (
                                            <React.Fragment key={i}>
                                                <KeyCap label={k} size="md" />
                                                {i < keys.length - 1 && <span className="text-slate-400 font-bold">+</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-4">
                         {!fcFlipped && (
                            <button
                                onClick={() => { setFcFlipped(true); setIsPracticeMode(false); }}
                                className="w-full py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="w-5 h-5"/> Show Answer
                            </button>
                         )}
                         {fcFlipped && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setFcFlipped(false); setIsPracticeMode(autoPractice); setPressedKeys([]); }}
                                    className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-center gap-2"
                                >
                                    <EyeOff className="w-5 h-5"/> Keep Practicing
                                </button>
                                <button
                                    onClick={() => handleCorrect(currentCard)}
                                    className="py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5"/> I Know This
                                </button>
                            </div>
                         )}
                    </div>
                </div>

                {/* Session Log */}
                {sessionLog.length > 0 && (
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-2">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-500" /> Session Log
                        </h3>
                         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            {sessionLog.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {log.result === 'correct' ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                                <SkipForward className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{log.shortcutDesc}</span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono">
                                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                    </span>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>
        );
    };

    // --- Empty State ---
    if (bookmarkedIds.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <BookMarked className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your library is empty</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                    Choose a starter pack or browse the database to add shortcuts.
                </p>
                <div className="w-full max-w-4xl text-left">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CURATED_PLANS.slice(0, 3).map(plan => (
                            <div key={plan.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors cursor-pointer group" onClick={() => addBookmarks(plan.ids as string[])}>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">{plan.title}</h4>
                                <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded">Add {plan.ids.length} Cards</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[600px]">
            {viewMode === 'library' && renderLibrary()}
            {viewMode === 'deck' && renderDeckDetail()}
            {viewMode === 'practice' && renderPractice()}
        </div>
    );
};