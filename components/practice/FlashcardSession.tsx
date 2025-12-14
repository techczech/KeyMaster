import React, { useState, useEffect, useMemo } from 'react';
import { Shortcut, Platform, LogEntry } from '../../types';
import { SHORTCUTS } from '../../constants';
import { KeyCap } from '../KeyCap';
import { 
    Play, 
    ArrowLeft, 
    SkipForward, 
    Keyboard, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    Trophy, 
    History,
    Layout,
    ShieldAlert
} from 'lucide-react';

interface FlashcardSessionProps {
    bookmarkedIds: string[];
    masteredIds: string[];
    platform: Platform;
    deckId?: string | null; // If null, practice all active
    customQueueIds?: string[]; // Overrides standard queue generation if present
    onMarkMastered: (id: string) => void;
    onExit: () => void;
}

// Helper to determine if a shortcut is safe to practice via keyboard listener
const isSafeToPractice = (shortcut: Shortcut, platform: Platform): boolean => {
    // Explicitly allow "Go to end of line" to be typed directly
    if (shortcut.id === 'txt-5') return true;

    const keys = (platform === Platform.MAC && shortcut.macKeys) ? shortcut.macKeys : shortcut.keys;
    if (!keys) return true;
    const keyString = keys.join('+').toLowerCase();
    
    // Safety check logic duplicated from original file for now
    if (keyString.includes('alt+tab') || keyString.includes('cmd+tab')) return false;
    if (keyString.includes('alt+f4')) return false;
    if (keyString.includes('ctrl+w') || keyString.includes('cmd+w')) return false; 
    if (keyString.includes('ctrl+n') || keyString.includes('cmd+n')) return false; 
    if (keyString.includes('ctrl+t') || keyString.includes('cmd+t')) return false; 
    if (keyString.includes('win+l')) return false; 
    if (keyString.includes('f5')) return false; 
    if (keyString.includes('f11')) return false; 
    if (keyString.includes('f12')) return false; 
    
    const desc = shortcut.description.toLowerCase();
    if (desc.includes('close current application')) return false;
    if (desc.includes('switch between open applications')) return false;
    
    return true;
};

export const FlashcardSession: React.FC<FlashcardSessionProps> = ({
    bookmarkedIds,
    masteredIds,
    platform,
    deckId,
    customQueueIds,
    onMarkMastered,
    onExit
}) => {
    // Session State
    const [fcIndex, setFcIndex] = useState(0);
    const [fcFlipped, setFcFlipped] = useState(false);
    const [autoPractice, setAutoPractice] = useState(true);
    const [isPracticeMode, setIsPracticeMode] = useState(true);
    const [pressedKeys, setPressedKeys] = useState<string[]>([]);
    const [practiceFeedback, setPracticeFeedback] = useState<'idle' | 'success' | 'error'>('idle');
    const [mcOptions, setMcOptions] = useState<string[][]>([]);
    const [sessionLog, setSessionLog] = useState<LogEntry[]>([]);

    // 1. Prepare Queue
    const practiceQueue = useMemo(() => {
        let candidates: Shortcut[] = [];

        if (customQueueIds) {
            candidates = SHORTCUTS.filter(s => customQueueIds.includes(s.id));
        } else {
            candidates = SHORTCUTS.filter(s => bookmarkedIds.includes(s.id));
            
            // Filter by deck if specified
            if (deckId && deckId !== 'all') {
                 if (deckId.startsWith('cat-')) {
                     const cat = deckId.replace('cat-', '');
                     candidates = candidates.filter(s => s.category === cat);
                 } else if (deckId.startsWith('plan-')) {
                     // Logic to find plan IDs if needed
                 }
            }
        }
        
        // Filter out mastered
        return candidates.filter(s => !masteredIds.includes(s.id));
    }, [bookmarkedIds, masteredIds, deckId, customQueueIds]);

    const getKeysForPlatform = (s: Shortcut) => (platform === Platform.MAC && s.macKeys) ? s.macKeys : s.keys;

    // 2. Queue Safety
    useEffect(() => {
        if (fcIndex >= practiceQueue.length && practiceQueue.length > 0) {
            setFcIndex(0);
        }
    }, [practiceQueue.length, fcIndex]);

    // 3. MC Generation
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
    }, [fcIndex, practiceQueue, platform]);

    // 4. Input Listener
    useEffect(() => {
        if (!isPracticeMode || fcFlipped || practiceQueue.length === 0) return;
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
            if (key === 'Tab') return 'Tab';
            if (key.length === 1) return key.toUpperCase();
            return key;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (practiceFeedback !== 'idle') return;

            const label = mapKey(e.key);
            const MODIFIERS = ['Ctrl', 'Alt', 'Shift', 'Win', 'Cmd', 'Option'];
            const isInputModifier = MODIFIERS.includes(label);

            // Strict Order Check:
            // If the target shortcut requires a modifier, and the user presses a non-modifier key
            // WITHOUT holding the modifier, trigger immediate error.
            const targetKeys = getKeysForPlatform(currentShortcut);
            const targetHasModifier = targetKeys.some(k => MODIFIERS.includes(k));

            if (targetHasModifier && !isInputModifier) {
                const hasModifierHeld = e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
                if (!hasModifierHeld) {
                    setPressedKeys([label]); // Show the wrong key
                    setPracticeFeedback('error');
                    // Persist error for a moment so user sees it
                    setTimeout(() => {
                        setPressedKeys([]);
                        setPracticeFeedback('idle');
                    }, 1500);
                    return;
                }
            }

            setPressedKeys(prev => {
                const label = mapKey(e.key);
                return prev.includes(label) ? prev : [...prev, label];
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (practiceFeedback !== 'idle') return;

            const label = mapKey(e.key);
            setPressedKeys(prev => prev.filter(k => k !== label));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Lock keyboard if possible
        if (navigator && 'keyboard' in navigator && (navigator as any).keyboard.lock) {
            (navigator as any).keyboard.lock().catch(() => {});
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
             if (navigator && 'keyboard' in navigator && (navigator as any).keyboard.unlock) {
                (navigator as any).keyboard.unlock();
            }
        };
    }, [isPracticeMode, fcIndex, practiceQueue, platform, fcFlipped, practiceFeedback]);

    // 5. Validation Logic
    useEffect(() => {
        if (!isPracticeMode || fcFlipped || practiceQueue.length === 0) return;
        const currentShortcut = practiceQueue[fcIndex];
        if (!currentShortcut || !isSafeToPractice(currentShortcut, platform)) return;
        if (practiceFeedback !== 'idle') return;

        const targetKeys = getKeysForPlatform(currentShortcut);

        if (pressedKeys.length > targetKeys.length) {
            setPracticeFeedback('error');
            setTimeout(() => { setPressedKeys([]); setPracticeFeedback('idle'); }, 1500);
            return;
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
                setTimeout(() => handleCorrect(currentShortcut), 800);
            } else {
                setPracticeFeedback('error');
                setTimeout(() => { setPressedKeys([]); setPracticeFeedback('idle'); }, 1500);
            }
        }
    }, [pressedKeys, isPracticeMode, fcIndex, practiceQueue, platform, practiceFeedback]);

    const handleCorrect = (shortcut: Shortcut) => {
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
        setFcIndex(prev => (prev + 1) % practiceQueue.length);
        setPressedKeys([]);
        setPracticeFeedback('idle');
    };
    
    const handleMcClick = (selectedKeys: string[]) => {
        const currentCard = practiceQueue[fcIndex];
        const correctKeys = getKeysForPlatform(currentCard);
        if (JSON.stringify(selectedKeys) === JSON.stringify(correctKeys)) {
             setPracticeFeedback('success');
             setTimeout(() => handleCorrect(currentCard), 800);
        } else {
             setPracticeFeedback('error');
             setTimeout(() => setPracticeFeedback('idle'), 500);
        }
    };

    // --- Render Views ---

    if (practiceQueue.length === 0) {
        return (
            <div className="max-w-xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                        <Trophy className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">All Caught Up!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg relative z-10">
                        {customQueueIds 
                            ? "You've finished your quick practice session."
                            : "You've mastered all items in this queue."
                        }
                    </p>
                    <button
                        onClick={onExit}
                        className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 relative z-10"
                    >
                        <Layout className="w-5 h-5" />
                        Back to Hub
                    </button>
                </div>
                {/* Session Log */}
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={onExit}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Stop
                </button>
                
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

            {/* Card */}
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
                                <div className="w-full max-w-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
                                        <ShieldAlert className="w-4 h-4" />
                                        System Shortcut - Manual Selection Mode
                                    </div>
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