import React, { useState, useEffect, useRef } from 'react';
import { Platform } from '../types';
import { KeyCap } from './KeyCap';
import { CheckCircle2, RotateCcw, AlertCircle, GripVertical } from 'lucide-react';

interface OutlineLevelProps {
    platform: Platform;
    mode: 'indent' | 'heading';
}

interface ListItem {
    id: string;
    text: string;
    depth: number; // 0, 1, 2
    type: 'body' | 'h1' | 'h2' | 'h3';
}

const INITIAL_DATA: ListItem[] = [
    { id: '1', text: 'Project Alpha Launch', depth: 0, type: 'h1' },
    { id: '2', text: 'Preparation Phase', depth: 0, type: 'h2' },
    { id: '3', text: 'Define scope', depth: 0, type: 'body' },
    { id: '4', text: 'Assemble team', depth: 0, type: 'body' },
    { id: '5', text: 'Execution', depth: 0, type: 'h2' },
    { id: '6', text: 'Development', depth: 0, type: 'body' },
    { id: '7', text: 'Frontend', depth: 0, type: 'body' },
    { id: '8', text: 'Backend', depth: 0, type: 'body' },
    { id: '9', text: 'Testing', depth: 0, type: 'body' }
];

// Target state for Level 2 (Indentation)
const TARGET_INDENT: ListItem[] = [
    { id: '1', text: 'Project Alpha Launch', depth: 0, type: 'body' }, // Type ignored in indent mode
    { id: '2', text: 'Preparation Phase', depth: 0, type: 'body' },
    { id: '3', text: 'Define scope', depth: 1, type: 'body' },
    { id: '4', text: 'Assemble team', depth: 1, type: 'body' },
    { id: '5', text: 'Execution', depth: 0, type: 'body' },
    { id: '6', text: 'Development', depth: 1, type: 'body' },
    { id: '7', text: 'Frontend', depth: 2, type: 'body' },
    { id: '8', text: 'Backend', depth: 2, type: 'body' },
    { id: '9', text: 'Testing', depth: 1, type: 'body' }
];

// Target state for Level 3 (Headings)
const TARGET_HEADING: ListItem[] = [
    { id: '1', text: 'Project Alpha Launch', depth: 0, type: 'h1' },
    { id: '2', text: 'Preparation Phase', depth: 0, type: 'h2' },
    { id: '3', text: 'Define scope', depth: 0, type: 'body' },
    { id: '4', text: 'Assemble team', depth: 0, type: 'body' },
    { id: '5', text: 'Execution', depth: 0, type: 'h2' },
    { id: '6', text: 'Development', depth: 0, type: 'h3' },
    { id: '7', text: 'Frontend', depth: 0, type: 'body' },
    { id: '8', text: 'Backend', depth: 0, type: 'body' },
    { id: '9', text: 'Testing', depth: 0, type: 'h3' }
];

export const OutlineLevel: React.FC<OutlineLevelProps> = ({ platform, mode }) => {
    // Reset state when mode changes
    const [items, setItems] = useState<ListItem[]>(() => 
        INITIAL_DATA.map(i => ({ ...i, depth: 0, type: 'body' })) // Start flat
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load reset
    useEffect(() => {
        setItems(INITIAL_DATA.map(i => ({ ...i, depth: 0, type: 'body' })));
        setActiveIndex(0);
        setCompleted(false);
        // Focus container
        setTimeout(() => containerRef.current?.focus(), 100);
    }, [mode]);

    // Check completion
    useEffect(() => {
        const target = mode === 'indent' ? TARGET_INDENT : TARGET_HEADING;
        const isMatch = items.every((item, idx) => {
            if (mode === 'indent') return item.depth === target[idx].depth;
            return item.type === target[idx].type;
        });

        if (isMatch) setCompleted(true);
    }, [items, mode]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (completed) return;

        // Prevent default tab behavior (losing focus)
        if (e.key === 'Tab') {
            e.preventDefault();
        }

        // Navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(0, prev - 1));
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(items.length - 1, prev + 1));
            return;
        }

        // Logic
        if (mode === 'indent') {
            if (e.key === 'Tab') {
                const direction = e.shiftKey ? -1 : 1;
                setItems(prev => {
                    const newItems = [...prev];
                    const newDepth = Math.max(0, Math.min(3, newItems[activeIndex].depth + direction));
                    newItems[activeIndex] = { ...newItems[activeIndex], depth: newDepth };
                    return newItems;
                });
            }
        } else {
            // Heading Mode
            // Win: Alt + Shift + Left/Right
            // Mac: Ctrl + Cmd + Left/Right (Standard Word shortcut is roughly this, or Ctrl+Alt+Left/Right)
            // Let's stick to standard OS text editing shortcuts where possible, 
            // but for Headings specifically, Word uses Alt+Shift+Left/Right on Windows. 
            // On Mac, it's often Ctrl+Shift+Left/Right or Cmd+Option+Left/Right.
            // Let's simplify for the simulator and capture:
            // Win: Alt + Shift + Arrows
            // Mac: Cmd + Ctrl + Arrows (or Cmd + Option)

            const isWinMod = platform === Platform.WINDOWS && e.altKey && e.shiftKey;
            const isMacMod = platform === Platform.MAC && (e.metaKey && e.ctrlKey || e.metaKey && e.altKey);

            if ((isWinMod || isMacMod) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                const direction = e.key === 'ArrowRight' ? 1 : -1; // Right = Demote (Body), Left = Promote (H1)
                
                // Logic: H1 (0) <-> H2 (1) <-> H3 (2) <-> Body (3)
                // Promoting (Left) decreases index. Demoting (Right) increases index.
                
                const types: ListItem['type'][] = ['h1', 'h2', 'h3', 'body'];
                
                setItems(prev => {
                    const newItems = [...prev];
                    const currentType = newItems[activeIndex].type;
                    const currentIndex = types.indexOf(currentType);
                    
                    let newTypeIndex = currentIndex + direction;
                    newTypeIndex = Math.max(0, Math.min(3, newTypeIndex));
                    
                    newItems[activeIndex] = { ...newItems[activeIndex], type: types[newTypeIndex] };
                    return newItems;
                });
            }
        }
    };

    const getKeysInstruction = () => {
        if (mode === 'indent') {
            return (
                <div className="flex gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><KeyCap label="Tab" size="sm"/> <span>Indent</span></div>
                    <div className="flex items-center gap-1"><KeyCap label="Shift" size="sm"/><KeyCap label="Tab" size="sm"/> <span>Outdent</span></div>
                </div>
            );
        } else {
            const mod1 = platform === Platform.MAC ? 'Cmd' : 'Alt';
            const mod2 = platform === Platform.MAC ? 'Ctrl' : 'Shift';
            return (
                <div className="flex gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                        <KeyCap label={mod1} size="sm"/><KeyCap label={mod2} size="sm"/><KeyCap label="Left" size="sm"/> 
                        <span>Promote Heading</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <KeyCap label={mod1} size="sm"/><KeyCap label={mod2} size="sm"/><KeyCap label="Right" size="sm"/> 
                        <span>Demote Heading</span>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col h-full outline-none" tabIndex={0} onKeyDown={handleKeyDown} ref={containerRef}>
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {mode === 'indent' ? 'Match the Indentation' : 'Structure the Document'}
                    </h2>
                    {getKeysInstruction()}
                </div>
                {completed && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg animate-in zoom-in">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">Matched!</span>
                    </div>
                )}
                <button 
                    onClick={() => {
                        setItems(INITIAL_DATA.map(i => ({ ...i, depth: 0, type: 'body' })));
                        setActiveIndex(0);
                        setCompleted(false);
                        containerRef.current?.focus();
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                {/* Target Column */}
                <div className="flex-1 p-8 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Target Goal</h3>
                    <div className="space-y-3 font-mono text-sm opacity-70 select-none pointer-events-none">
                        {(mode === 'indent' ? TARGET_INDENT : TARGET_HEADING).map((item) => (
                            <div 
                                key={item.id}
                                className={`
                                    transition-all duration-300
                                    ${item.type === 'h1' ? 'text-xl font-bold text-slate-800 dark:text-slate-200' : ''}
                                    ${item.type === 'h2' ? 'text-lg font-bold text-slate-700 dark:text-slate-300' : ''}
                                    ${item.type === 'h3' ? 'text-base font-bold text-slate-600 dark:text-slate-400' : ''}
                                    ${item.type === 'body' ? 'text-slate-500' : ''}
                                `}
                                style={{ paddingLeft: `${item.depth * 24}px` }}
                            >
                                <span className="mr-2 opacity-50">•</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor Column */}
                <div className="flex-1 p-8 relative">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-6">Your Editor</h3>
                    <div className="space-y-3 font-mono text-sm">
                        {items.map((item, index) => (
                            <div 
                                key={item.id}
                                className={`
                                    relative transition-all duration-200 p-2 rounded-lg cursor-pointer
                                    ${index === activeIndex ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500/50' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}
                                    ${item.type === 'h1' ? 'text-xl font-bold text-slate-900 dark:text-white' : ''}
                                    ${item.type === 'h2' ? 'text-lg font-bold text-slate-800 dark:text-slate-200' : ''}
                                    ${item.type === 'h3' ? 'text-base font-bold text-slate-700 dark:text-slate-300' : ''}
                                    ${item.type === 'body' ? 'text-slate-600 dark:text-slate-400' : ''}
                                `}
                                style={{ marginLeft: `${item.depth * 24}px` }}
                                onClick={() => setActiveIndex(index)}
                            >
                                {index === activeIndex && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-indigo-500">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                )}
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-2 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
                Use Up/Down arrows to navigate.
            </div>
        </div>
    );
};