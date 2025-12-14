import React, { useState, useEffect, useRef } from 'react';
import { Platform } from '../types';
import { KeyCap } from './KeyCap';
import { MousePointer2, AlertCircle, CheckCircle2, RotateCcw, ArrowRight, Lock } from 'lucide-react';

interface TextNavLevelProps {
    platform: Platform;
}

interface Task {
    id: string;
    instruction: string;
    hint: string;
    keys: string[];
    macKeys: string[];
    // validation logic
    check: (text: string, selectionStart: number, selectionEnd: number) => boolean;
}

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.\nSphinx of black quartz, judge my vow.";

export const TextNavLevel: React.FC<TextNavLevelProps> = ({ platform }) => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [text, setText] = useState(SAMPLE_TEXT);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [showMouseWarning, setShowMouseWarning] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus management
    useEffect(() => {
        if (completed) return;
        // Focus whenever task changes or on mount
        const timer = setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Optional: Keep selection from previous task? 
                // Usually better to let user flow, but for level 1 task 1 we reset.
                if (currentTaskIndex === 0) {
                     textareaRef.current.setSelectionRange(0, 0);
                }
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [currentTaskIndex, completed]);

    const tasks: Task[] = [
        {
            id: 'word-right',
            instruction: "Move the cursor to the beginning of 'brown'",
            hint: "Jump by word",
            keys: ['Ctrl', 'Right'],
            macKeys: ['Option', 'Right'],
            check: (_, start, end) => start === 10 && end === 10
        },
        {
            id: 'select-word',
            instruction: "Select the word 'brown'",
            hint: "Select by word",
            keys: ['Ctrl', 'Shift', 'Right'],
            macKeys: ['Option', 'Shift', 'Right'],
            check: (txt, start, end) => txt.substring(start, end) === 'brown'
        },
        {
            id: 'line-end',
            instruction: "Move cursor to the end of the first line",
            hint: "Jump to line end",
            keys: ['End'],
            macKeys: ['Cmd', 'Right'],
            check: (_, start, end) => start === 44 && end === 44
        },
        {
            id: 'select-line-start',
            instruction: "Select everything from the end backwards to the start of the line",
            hint: "Select to line start",
            keys: ['Shift', 'Home'],
            macKeys: ['Cmd', 'Shift', 'Left'],
            check: (txt, start, end) => start === 0 && end === 44
        },
        {
            id: 'next-para',
            instruction: "Jump down to the start of the next paragraph ('Pack')",
            hint: "Move down",
            keys: ['Down', 'Home'],
            macKeys: ['Down', 'Cmd', 'Left'],
            check: (_, start, end) => start === 45 && end === 45
        },
        {
            id: 'select-para-end',
            instruction: "Select from 'Pack' to the end of the document",
            hint: "Select to document end",
            keys: ['Ctrl', 'Shift', 'End'],
            macKeys: ['Cmd', 'Shift', 'Down'],
            check: (txt, start, end) => start === 45 && end === txt.length
        }
    ];

    const currentTask = tasks[currentTaskIndex];
    const displayKeys = platform === Platform.MAC ? currentTask?.macKeys : currentTask?.keys;

    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        setSelection({ start: target.selectionStart, end: target.selectionEnd });

        if (currentTask && currentTask.check(target.value, target.selectionStart, target.selectionEnd)) {
            // Success!
            if (currentTaskIndex < tasks.length - 1) {
                 // Brief success feedback could go here
                 setCurrentTaskIndex(prev => prev + 1);
            } else {
                setCompleted(true);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Clear feedback
        if (feedback) setFeedback(null);

        // Allow navigation keys
        const navKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'];
        const modifierKeys = ['Shift','Control','Alt','Meta', 'Tab', 'CapsLock'];
        
        if (navKeys.includes(e.key) || modifierKeys.includes(e.key)) {
            return;
        }

        // Allow shortcuts like Ctrl+C (Copy), Ctrl+A (Select All)
        if ((e.ctrlKey || e.metaKey) && ['c','a'].includes(e.key.toLowerCase())) {
            return;
        }
        
        // Prevent editing keys
        e.preventDefault();
        setFeedback("Editing is disabled for this exercise. Use navigation keys only.");
    };

    const handleReset = () => {
        setCompleted(false);
        setCurrentTaskIndex(0);
        setText(SAMPLE_TEXT);
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(0, 0);
        }
    };

    const handleMouseMove = () => {
        if (!completed) {
            setShowMouseWarning(true);
            setTimeout(() => setShowMouseWarning(false), 2000);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header / Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {!completed ? (
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                                Task {currentTaskIndex + 1}/{tasks.length}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">
                                Pos: {selection.start} {selection.start !== selection.end && `- ${selection.end}`}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {currentTask.instruction}
                        </h2>
                        <div className="flex items-center gap-2 text-slate-500">
                            <span className="text-sm">Hint:</span>
                            {displayKeys?.map((k, i) => (
                                <React.Fragment key={i}>
                                    <KeyCap label={k} size="sm" />
                                    {i < displayKeys.length - 1 && <span>+</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Level 1 Complete!</h2>
                            <p className="text-emerald-600 dark:text-emerald-400">You've mastered basic navigation.</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                     {showMouseWarning && (
                        <div className="animate-in fade-in slide-in-from-right duration-300 flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200 dark:border-amber-800">
                            <MousePointer2 className="w-4 h-4" />
                            <span>No mouse allowed!</span>
                        </div>
                     )}
                     <button 
                        onClick={handleReset}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Reset Level"
                    >
                        <RotateCcw className="w-5 h-5" />
                     </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-slate-900 p-8 relative font-mono text-lg leading-relaxed flex flex-col">
                <div className="relative flex-1">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        // Important: readOnly={false} is needed for cursor interaction, but we block edits via onKeyDown/onChange
                        readOnly={false} 
                        onChange={() => {
                            // React requires an onChange handler for controlled inputs
                            // We do nothing here, which forces the value to stay as `text` state
                            // This effectively makes it read-only for content but allows caret movement
                        }}
                        onSelect={handleSelect}
                        onMouseMove={handleMouseMove}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full bg-transparent text-slate-300 focus:outline-none resize-none selection:bg-indigo-500/50 selection:text-white caret-indigo-400"
                        spellCheck={false}
                        autoFocus
                    />
                    
                    {/* Feedback Overlay */}
                    {feedback && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 px-4 py-2 rounded-full text-sm font-medium border border-slate-700 shadow-lg animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
                             <Lock className="w-4 h-4" />
                             {feedback}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Instruction Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 text-center">
                 <p className="text-sm text-slate-500">
                    Click inside the box to focus, then use your keyboard to navigate. Editing is disabled.
                 </p>
            </div>
        </div>
    );
};