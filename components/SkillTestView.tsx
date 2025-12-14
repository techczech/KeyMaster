import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SHORTCUTS } from '../constants';
import { Shortcut, Platform } from '../types';
import { KeyCap } from './KeyCap';
import { 
    Timer, 
    CheckCircle2, 
    AlertCircle, 
    Play, 
    X,
    TrendingUp,
    ListTodo,
    Monitor,
    AppWindow,
    ShieldAlert,
    ArrowRight,
    Terminal,
    Globe,
    Zap
} from 'lucide-react';

interface SkillTestViewProps {
    platform: Platform;
    onPlatformChange: (p: Platform) => void;
    onComplete: (results: { mastered: string[], practice: string[] }) => void;
    onExit: () => void;
}

type TestPhase = 'intro' | 'level-intro' | 'active' | 'report';

interface TestResult {
    shortcutId: string;
    level: number;
    timeTaken: number;
    status: 'mastered' | 'practice' | 'unknown';
}

// Curriculum Definitions
const LEVEL_CONFIG = [
    {
        level: 1,
        title: "The Essentials",
        description: "The absolute most common shortcuts. Bold, Copy, Paste, Undo, and Switch Window.",
        icon: Zap,
        ids: ['txt-1', 'cc-1', 'cc-3', 'cc-4', 'win-1'] // Bold, Copy, Paste, Undo, Switch Window (Alt+Tab)
    },
    {
        level: 2,
        title: "Browser Mastery",
        description: "Navigate the web at speed. Tabs, navigation, and reopening pages.",
        icon: Globe,
        ids: ['web-2', 'web-3', 'nav-5', 'nav-6', 'web-13'] // New Tab, Close Tab, Tab, Shift+Tab, Reopen Tab
    },
    {
        level: 3,
        title: "Text Power User",
        description: "Navigate and select text without touching the mouse.",
        icon: Terminal,
        ids: ['txt-2', 'txt-3', 'txt-4', 'txt-5'] // Move word, Select word, Home, End
    }
];

const TIME_LIMIT = 15; // Seconds per question
const MASTERY_THRESHOLD = 5; // Seconds to consider "mastered"

// Helper to check if a shortcut is safe to practice
const isSafeForTest = (shortcut: Shortcut, platform: Platform): boolean => {
    // Explicitly allow "Go to end of line" to be typed directly
    if (shortcut.id === 'txt-5') return true;

    const keys = (platform === Platform.MAC && shortcut.macKeys) ? shortcut.macKeys : shortcut.keys;
    if (!keys) return true;
    const keyString = keys.join('+').toLowerCase();

    // 1. Browser/Tab Management (Always dangerous)
    if (keyString.includes('ctrl+w') || keyString.includes('cmd+w')) return false; // Close Tab
    if (keyString.includes('ctrl+shift+w') || keyString.includes('cmd+shift+w')) return false; // Close Window
    if (keyString.includes('ctrl+t') || keyString.includes('cmd+t')) return false; // New Tab
    if (keyString.includes('ctrl+n') || keyString.includes('cmd+n')) return false; // New Window
    if (keyString.includes('ctrl+shift+n') || keyString.includes('cmd+shift+n')) return false; // Incognito
    if (keyString.includes('ctrl+shift+t') || keyString.includes('cmd+shift+t')) return false; // Reopen Tab
    if (keyString.includes('f5')) return false; // Refresh
    if (keyString.includes('ctrl+r') || keyString.includes('cmd+r')) return false; // Refresh
    if (keyString.includes('f11')) return false; // Fullscreen (can confuse user)
    if (keyString.includes('f12')) return false; // DevTools
    if (keyString.includes('ctrl+p') || keyString.includes('cmd+p')) return false; // Print (Modal)
    if (keyString.includes('ctrl+o') || keyString.includes('cmd+o')) return false; // Open File (Modal)

    // 2. System Focus Stealing & OS Actions
    if (keyString.includes('alt+tab') || keyString.includes('cmd+tab')) return false; // App Switch
    if (keyString.includes('win')) return false; // Windows Key (Start Menu etc)
    if (keyString.includes('cmd+space')) return false; // Spotlight
    if (keyString.includes('alt+f4')) return false; // Close App
    if (keyString.includes('cmd+q')) return false; // Quit App
    if (keyString.includes('ctrl+alt+del')) return false; // Security Screen
    if (keyString.includes('ctrl+shift+esc')) return false; // Task Manager
    if (keyString.includes('cmd+option+esc')) return false; // Force Quit
    
    // 3. MacOS specific "Hide"
    if (keyString.includes('cmd+h')) return false;

    return true;
};

const detectPlatform = (): Platform => {
    if (typeof navigator === 'undefined') return Platform.WINDOWS;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return Platform.MAC;
    return Platform.WINDOWS;
};

export const SkillTestView: React.FC<SkillTestViewProps> = ({ platform, onPlatformChange, onComplete, onExit }) => {
    const [phase, setPhase] = useState<TestPhase>('intro');
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    
    const [currentLevelQuestions, setCurrentLevelQuestions] = useState<Shortcut[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [results, setResults] = useState<TestResult[]>([]);
    
    // Active Question State
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [pressedKeys, setPressedKeys] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
    const [timerActive, setTimerActive] = useState(false);
    
    // Multiple Choice State
    const [mcOptions, setMcOptions] = useState<string[][]>([]);

    // Detect platform on mount
    useEffect(() => {
        const detected = detectPlatform();
        if (detected !== platform) {
            onPlatformChange(detected);
        }
    }, []);

    const loadLevel = (levelIdx: number) => {
        const config = LEVEL_CONFIG[levelIdx];
        const questions = SHORTCUTS.filter(s => config.ids.includes(s.id));
        // Ensure we found all IDs, fallback if data missing
        const finalQuestions = questions.length > 0 ? questions : SHORTCUTS.slice(0, 5); 
        
        setCurrentLevelQuestions(finalQuestions);
        setCurrentQuestionIndex(0);
        setPhase('level-intro');
    };

    const startLevel = () => {
        setPhase('active');
        setTimerActive(true);
        setTimeLeft(TIME_LIMIT);
        setFeedback('idle');
        setPressedKeys([]);
    };

    const currentQuestion = currentLevelQuestions[currentQuestionIndex];

    const getKeysForPlatform = useCallback((s: Shortcut) => {
        return (platform === Platform.MAC && s.macKeys) ? s.macKeys : s.keys;
    }, [platform]);

    const isCurrentQuestionSafe = useMemo(() => {
        if (!currentQuestion) return true;
        return isSafeForTest(currentQuestion, platform);
    }, [currentQuestion, platform]);

    // Setup MC options if needed
    useEffect(() => {
        if (phase === 'active' && currentQuestion && !isCurrentQuestionSafe) {
            const correctKeys = getKeysForPlatform(currentQuestion);
            const otherShortcuts = SHORTCUTS.filter(s => s.id !== currentQuestion.id);
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
    }, [phase, currentQuestion, isCurrentQuestionSafe, platform, getKeysForPlatform]);

    // Timer Logic
    useEffect(() => {
        let interval: number;
        if (phase === 'active' && timerActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && phase === 'active') {
            handleAnswer(false, TIME_LIMIT);
        }
        return () => clearInterval(interval);
    }, [phase, timerActive, timeLeft]);

    // Input Listener
    useEffect(() => {
        if (phase !== 'active' || !timerActive || !currentQuestion || !isCurrentQuestionSafe) return;

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
            
            if (feedback !== 'idle') return; // Block input during feedback (success or error)

            const label = mapKey(e.key);
            const MODIFIERS = ['Ctrl', 'Alt', 'Shift', 'Win', 'Cmd', 'Option'];
            const isInputModifier = MODIFIERS.includes(label);

            // Strict Order Check:
            // If the target shortcut requires a modifier, and the user presses a non-modifier key
            // WITHOUT holding the modifier, trigger immediate error.
            const targetKeys = getKeysForPlatform(currentQuestion);
            const targetHasModifier = targetKeys.some(k => MODIFIERS.includes(k));

            if (targetHasModifier && !isInputModifier) {
                const hasModifierHeld = e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
                if (!hasModifierHeld) {
                    setPressedKeys([label]); // Show the wrong key
                    setFeedback('error');
                    // Persist error for a moment so user sees it
                    setTimeout(() => {
                        setPressedKeys([]);
                        setFeedback('idle');
                    }, 1500);
                    return;
                }
            }

            setPressedKeys(prev => {
                return prev.includes(label) ? prev : [...prev, label];
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            e.preventDefault();
            if (feedback !== 'idle') return;

            const label = mapKey(e.key);
            setPressedKeys(prev => prev.filter(k => k !== label));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
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
    }, [phase, timerActive, currentQuestion, platform, isCurrentQuestionSafe, feedback]);

    // Check Answer (Keyboard)
    useEffect(() => {
        if (pressedKeys.length === 0 || phase !== 'active' || !currentQuestion || !isCurrentQuestionSafe) return;
        if (feedback !== 'idle') return;

        const targetKeys = getKeysForPlatform(currentQuestion);
        
        if (pressedKeys.length === targetKeys.length) {
            const isMatch = targetKeys.every(targetKey => {
                if (targetKey === 'Arrow') {
                    return pressedKeys.some(k => ['Up', 'Down', 'Left', 'Right'].includes(k));
                }
                return pressedKeys.some(k => k.toLowerCase() === targetKey.toLowerCase());
            });

            if (isMatch) {
                setFeedback('success');
                setTimerActive(false);
                setTimeout(() => {
                    handleAnswer(true, TIME_LIMIT - timeLeft);
                }, 1500); // Increased persist time for success
            } else {
                 setFeedback('error');
                 // Persist error for a moment so user sees it
                 setTimeout(() => {
                     setPressedKeys([]);
                     setFeedback('idle');
                 }, 1500);
            }
        } else if (pressedKeys.length > targetKeys.length) {
            setFeedback('error');
            // Persist error for a moment so user sees it
            setTimeout(() => {
                setPressedKeys([]);
                setFeedback('idle');
            }, 1500);
        }

    }, [pressedKeys, currentQuestion, phase, getKeysForPlatform, isCurrentQuestionSafe, feedback]);

    // Check Answer (Multiple Choice)
    const handleMcAnswer = (selectedKeys: string[]) => {
        const targetKeys = getKeysForPlatform(currentQuestion);
        const isMatch = JSON.stringify(selectedKeys) === JSON.stringify(targetKeys);
        
        if (isMatch) {
            setFeedback('success');
            setTimerActive(false);
            setTimeout(() => {
                handleAnswer(true, TIME_LIMIT - timeLeft);
            }, 1500);
        } else {
            setFeedback('error');
            setTimerActive(false);
            setTimeout(() => {
                 handleAnswer(false, TIME_LIMIT); // Wrong answer counts as fail
            }, 800);
        }
    };


    const handleAnswer = (isCorrect: boolean, timeTaken: number) => {
        let status: TestResult['status'] = 'unknown';
        
        if (isCorrect) {
            if (timeTaken <= MASTERY_THRESHOLD) status = 'mastered';
            else status = 'practice';
        }

        const result: TestResult = {
            shortcutId: currentQuestion.id,
            level: currentLevelIndex + 1,
            timeTaken,
            status
        };

        setResults(prev => [...prev, result]);

        if (currentQuestionIndex < currentLevelQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeLeft(TIME_LIMIT);
            setPressedKeys([]);
            setFeedback('idle');
            setTimerActive(true);
        } else {
            // Level Finished
            if (currentLevelIndex < LEVEL_CONFIG.length - 1) {
                // Go to next level intro
                setCurrentLevelIndex(prev => prev + 1);
                loadLevel(currentLevelIndex + 1);
            } else {
                // All levels done
                setPhase('report');
            }
        }
    };

    const handleStartTest = () => {
        setResults([]);
        setCurrentLevelIndex(0);
        loadLevel(0);
    };

    const handleBuildPlan = () => {
        const mastered = results.filter(r => r.status === 'mastered').map(r => r.shortcutId);
        const practice = results.filter(r => r.status !== 'mastered').map(r => r.shortcutId);
        onComplete({ mastered, practice });
    };

    // --- Render Methods ---

    if (phase === 'intro') {
        return (
            <div className="max-w-2xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Timer className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Skill Assessment</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                        We'll test your speed across <strong>3 levels</strong> of difficulty. 
                        From essentials to power-user text navigation.
                    </p>
                    
                    {/* Platform Selection */}
                    <div className="mb-10 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 inline-block text-left w-full max-w-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">Confirm Platform</label>
                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                             <button 
                                onClick={() => onPlatformChange(Platform.WINDOWS)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${platform === Platform.WINDOWS ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                             >
                                <Monitor className="w-4 h-4" /> Windows
                             </button>
                             <button 
                                onClick={() => onPlatformChange(Platform.MAC)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${platform === Platform.MAC ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                             >
                                <AppWindow className="w-4 h-4" /> macOS
                             </button>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button onClick={onExit} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleStartTest} className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            <Play className="w-5 h-5 fill-current" />
                            Start Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'level-intro') {
        const config = LEVEL_CONFIG[currentLevelIndex];
        const Icon = config.icon;
        return (
            <div className="max-w-xl mx-auto py-20 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
                        <Icon className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-2 block">Level {config.level}</span>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{config.title}</h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-sm mx-auto">
                        {config.description}
                    </p>
                    <button 
                        onClick={startLevel}
                        className="px-8 py-4 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                    >
                        Ready <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'report') {
        const masteredCount = results.filter(r => r.status === 'mastered').length;
        const practiceCount = results.filter(r => r.status === 'practice').length;
        const unknownCount = results.filter(r => r.status === 'unknown').length;
        
        // Analyze Level 3 (Text Editing) performance specifically
        const level3Results = results.filter(r => r.level === 3);
        const level3PoorPerformance = level3Results.filter(r => r.status !== 'mastered').length > 1;

        return (
            <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Assessment Complete</h2>
                    <p className="text-slate-500 text-lg">
                        These specific shortcuts are the ones that can most improve productivity and system fluency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{masteredCount}</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Mastered</div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                            <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{practiceCount}</div>
                        <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Needs Practice</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{unknownCount}</div>
                        <div className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Unknown</div>
                    </div>
                </div>

                {level3PoorPerformance && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8 flex items-start gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-xl shrink-0">
                            <Terminal className="w-6 h-6 text-amber-700 dark:text-amber-200" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1">Recommendation: Use the Simulator</h4>
                            <p className="text-amber-800 dark:text-amber-300 text-sm mb-4">
                                We noticed you hesitated with text navigation shortcuts (Level 3). These are critical for editing speed. 
                                We suggest using the <strong>Text Simulator</strong> to build muscle memory in a safe environment.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-indigo-900 dark:bg-indigo-950 rounded-3xl p-8 text-white text-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">Your Custom Learning Plan</h3>
                        <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                            We've identified {practiceCount + unknownCount} shortcuts you should focus on. 
                            Add them to your interactive flashcard deck to master them quickly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                             <button
                                onClick={onExit}
                                className="px-6 py-3 rounded-xl font-medium text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Close Report
                            </button>
                            <button
                                onClick={handleBuildPlan}
                                className="px-8 py-3 rounded-xl font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ListTodo className="w-5 h-5" />
                                Build My Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
             <div className="flex items-center justify-between mb-6">
                <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-end">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">
                        Level {currentLevelIndex + 1}: {LEVEL_CONFIG[currentLevelIndex].title}
                    </div>
                    <div className="text-sm font-bold text-slate-400">
                        Question {currentQuestionIndex + 1} / {currentLevelQuestions.length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl min-h-[450px] flex flex-col relative overflow-hidden">
                
                {/* Timer Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                    />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 mt-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2 block">
                            {currentQuestion?.category}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            {currentQuestion?.description}
                        </h3>
                    </div>

                    {isCurrentQuestionSafe ? (
                        /* Keyboard Input Mode */
                        <div className={`
                            w-full max-w-md p-8 rounded-2xl border-2 transition-all duration-200
                            flex flex-col items-center justify-center min-h-[140px]
                            ${feedback === 'success' 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500' 
                                : feedback === 'error'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 animate-shake'
                                    : 'bg-slate-50 dark:bg-slate-800 border-indigo-500/30 dark:border-indigo-400/30 border-dashed'
                            }
                        `}>
                            {pressedKeys.length > 0 ? (
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {pressedKeys.map((k, i) => (
                                        <React.Fragment key={i}>
                                            <KeyCap label={k} size="md" variant={feedback === 'success' ? 'action' : 'default'} />
                                            {i < pressedKeys.length - 1 && <span className="text-slate-400 font-bold">+</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 dark:text-slate-500 font-medium">Perform the shortcut...</p>
                            )}
                        </div>
                    ) : (
                        /* Multiple Choice Mode */
                        <div className="w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                {mcOptions.map((optionKeys, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleMcAnswer(optionKeys)}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all flex flex-wrap justify-center gap-2
                                            ${feedback === 'error' ? 'opacity-50' : 'hover:border-indigo-400 hover:shadow-sm'}
                                            ${feedback === 'success' && JSON.stringify(optionKeys) === JSON.stringify(getKeysForPlatform(currentQuestion)) ? 'bg-emerald-50 border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
                                        `}
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
                            <div className="mt-6 flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-left">
                                <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                    <strong>Why multiple choice?</strong> This shortcut interacts with your system (e.g., switching apps). 
                                    We've switched modes to prevent interrupting your browsing session.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                     <button
                        onClick={() => handleAnswer(false, TIME_LIMIT)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                        Don't know? Skip
                    </button>
                </div>
            </div>
        </div>
    );
};