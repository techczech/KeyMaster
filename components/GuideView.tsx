import React, { useState, useEffect } from 'react';
import { KeyCap } from './KeyCap';
import { ChevronRight, ChevronLeft, Menu, X, BookOpen, MousePointer2, Keyboard, LayoutList, Layers, ScrollText, CheckCircle, ShieldAlert, Monitor, AppWindow } from 'lucide-react';
import { GuideQuiz } from './GuideQuiz';
import { UNCAPTURABLE_GUIDE_DATA } from '../constants';

interface GuideSectionData {
    id: string;
    title: string;
    icon: React.ElementType;
    content: React.ReactNode;
}

export const GuideView: React.FC = () => {
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'single-page' | 'step-by-step'>('single-page');
    const [limitationsTab, setLimitationsTab] = useState<'windows' | 'mac'>('windows');

    // Scroll to top when section changes in step-by-step mode
    useEffect(() => {
        if (viewMode === 'step-by-step') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeSectionIndex, viewMode]);

    const sections: GuideSectionData[] = [
        {
            id: 'intro',
            title: 'Introduction',
            icon: BookOpen,
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Introduction</h2>
                        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
                            <p className="leading-relaxed">
                                This document details useful shortcut keys for using the keyboard to navigate Windows computers. 
                                Mastering these allows you to work faster and more ergonomically.
                            </p>
                            <p className="mt-4">The guide is broken down into the following key areas:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 not-prose">
                                {[
                                    'Important Keys on a keyboard and what they do',
                                    'Common shortcut keys and their uses in different programs',
                                    'Keys for controlling the computer',
                                    'Shortcut keys for web browsing'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-1.5 rounded text-indigo-600 dark:text-indigo-400 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'learning',
            title: 'How to Learn',
            icon: MousePointer2,
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">How to learn keyboard shortcuts</h2>
                        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl p-6 md:p-8">
                            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed mb-6">
                                Keyboard shortcuts are like idioms in a foreign language. Over time, you can learn thousands of them and be much more fluent in your interactions.
                            </p>
                            <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="p-2 bg-indigo-500 rounded-lg text-white shrink-0">
                                    <Keyboard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Pattern Recognition</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        Learning shortcuts becomes easier as you start recognising patterns in seemingly arbitrary connections. 
                                        This document outlines patterns you may find useful to discover these connections.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'control-keys',
            title: 'Control Keys Basics',
            icon: LayoutList,
            content: (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Understanding the control keys</h2>
                        <div className="space-y-6 text-slate-700 dark:text-slate-300">
                            <p>
                                Control keys are keys on the keyboard that do not type in a letter but control the behaviour of the computer. There are two types:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors shadow-sm">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 block">Type 1</span>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Standalone Function</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Keys that perform an action immediately when pressed.</p>
                                    <div className="flex gap-2">
                                        <KeyCap label="Arrow" size="sm"/>
                                        <KeyCap label="Esc" size="sm"/>
                                        <KeyCap label="Enter" size="sm"/>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors shadow-sm">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 block">Type 2</span>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Combination Keys</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Used in combination with other keys to perform a function.</p>
                                    <div className="flex gap-2">
                                        <KeyCap label="Ctrl" size="sm"/>
                                        <KeyCap label="Alt" size="sm"/>
                                        <KeyCap label="Win" size="sm"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to press combinations correctly</h3>
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                The most common mistake people make with combinations like <KeyCap label="Ctrl" size="sm"/> + <KeyCap label="C" size="sm"/> is trying to press them at the same time.
                            </p>
                            <div className="flex flex-col md:flex-row items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-lg w-full md:w-auto shadow-sm border border-slate-100 dark:border-slate-700">
                                    <span className="text-indigo-600 dark:text-indigo-400 mb-2">Step 1</span>
                                    <span>Press & Hold Control Key</span>
                                    <KeyCap label="Ctrl" className="mt-2" />
                                </div>
                                <ChevronRight className="hidden md:block text-slate-400 dark:text-slate-600" />
                                <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-lg w-full md:w-auto shadow-sm border border-slate-100 dark:border-slate-700">
                                    <span className="text-indigo-600 dark:text-indigo-400 mb-2">Step 2</span>
                                    <span>Press Second Key</span>
                                    <KeyCap label="C" className="mt-2" />
                                </div>
                                <ChevronRight className="hidden md:block text-slate-400 dark:text-slate-600" />
                                <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-lg w-full md:w-auto shadow-sm border border-slate-100 dark:border-slate-700">
                                    <span className="text-indigo-600 dark:text-indigo-400 mb-2">Step 3</span>
                                    <span>Release Both</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'key-table',
            title: 'Control Key Table',
            icon: Keyboard,
            content: (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Table of Key Control Keys</h2>
                    <p className="text-slate-600 dark:text-slate-400">A comprehensive reference of what each control key does in various contexts.</p>
                    
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        <table className="w-full text-left text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0">Key</th>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0">On Interface</th>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0">In Combination</th>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0">In Text</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-800/30">
                                {[
                                    { k: 'Tab', i: 'Move to next screen element', c: '-', t: 'Insert indent' },
                                    { k: 'Enter', i: 'Execute command', c: 'New line (with shift)', t: 'Start new paragraph' },
                                    { k: 'Shift', i: '-', c: 'Reverse direction (with tab)\nStart selection (with arrows)', t: 'Make letter capitals' },
                                    { k: 'Space', i: 'Activate function', c: 'Open launcher (with ctrl)', t: 'Insert space' },
                                    { k: 'Arrows', i: 'Move left, right, up, down', c: 'Select (plus Shift)\nOpen menu (plus Alt)', t: 'Move by character' },
                                    { k: 'Win', i: 'Start search', c: 'Common control for windows', t: '-' },
                                    { k: 'Insert', i: '-', c: 'Control for NVDA or JAWS', t: 'Activates overwrite mode' },
                                    { k: 'Caps Lock', i: '-', c: 'Control for NVDA or JAWS', t: 'Turns on ALL CAPS' },
                                    { k: 'Ctrl', i: '-', c: 'Common control key', t: '-' },
                                    { k: 'Alt', i: 'Activates menus', c: 'Common control key', t: '-' },
                                    { k: 'Esc', i: 'Cancel/close dialog', c: '-', t: '-' },
                                ].map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                        <td className="p-4 align-top border-r border-slate-200 dark:border-slate-800/50">
                                            <KeyCap label={row.k} size="sm" />
                                        </td>
                                        <td className="p-4 align-top border-r border-slate-200 dark:border-slate-800/50">{row.i}</td>
                                        <td className="p-4 align-top border-r border-slate-200 dark:border-slate-800/50 whitespace-pre-line">{row.c}</td>
                                        <td className="p-4 align-top">{row.t}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        {
            id: 'macos',
            title: 'MacOS Controls',
            icon: BookOpen,
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">MacOS Control Keys</h2>
                        <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
                            <p className="text-slate-700 dark:text-slate-300 text-lg mb-6">
                                Many common key combinations are very similar on the Mac. The Mac has three main control keys:
                            </p>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-400 dark:text-slate-500 text-sm font-mono">1.</span>
                                    <KeyCap label="Ctrl" />
                                    <span className="text-slate-700 dark:text-white font-medium">Control</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-400 dark:text-slate-500 text-sm font-mono">2.</span>
                                    <KeyCap label="Option" />
                                    <span className="text-slate-700 dark:text-white font-medium">Option</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-400 dark:text-slate-500 text-sm font-mono">3.</span>
                                    <KeyCap label="Cmd" />
                                    <span className="text-slate-700 dark:text-white font-medium">Command</span>
                                </div>
                            </div>
                            
                            <div className="bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                                <h4 className="text-indigo-900 dark:text-white font-bold mb-1">Key Takeaway</h4>
                                <p className="text-indigo-800 dark:text-slate-300 text-sm">
                                    The only reliable mapping is that common <KeyCap label="Ctrl" size="sm"/> combinations on Windows usually use <KeyCap label="Cmd" size="sm"/> on Mac. 
                                    (e.g., Ctrl+C = Cmd+C).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'limitations',
            title: 'System Limitations',
            icon: ShieldAlert,
            content: (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Uncapturable Shortcuts</h2>
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8">
                             <div className="flex items-start gap-3">
                                <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-2">Why some shortcuts behave differently</h4>
                                    <p className="text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                                        Browser applications like KeyMaster cannot "capture" or prevent certain system-level shortcuts. 
                                        When you press these keys (like <KeyCap label="Ctrl" size="sm"/> + <KeyCap label="W" size="sm"/> to close a tab), 
                                        the browser or operating system will execute them immediately, interrupting your practice session.
                                    </p>
                                </div>
                             </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <button 
                                onClick={() => setLimitationsTab('windows')}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all ${limitationsTab === 'windows' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                            >
                                <Monitor className="w-4 h-4" /> Windows Reserved
                            </button>
                            <button 
                                onClick={() => setLimitationsTab('mac')}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all ${limitationsTab === 'mac' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                            >
                                <AppWindow className="w-4 h-4" /> MacOS Reserved
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {UNCAPTURABLE_GUIDE_DATA[limitationsTab].map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {item.keys.map((k, i) => (
                                            <span key={i} className="font-mono font-bold text-sm bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3 mt-2">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'common',
            title: 'Common Combinations',
            icon: LayoutList,
            content: (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Common Control Combinations</h2>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Ctrl Group */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                <KeyCap label="Ctrl" size="sm" />
                                <h3 className="text-slate-900 dark:text-white font-bold ml-2">Control Combinations</h3>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3">
                                    {[
                                        { k: 'C', d: 'Copy' }, { k: 'X', d: 'Cut' }, { k: 'V', d: 'Paste' },
                                        { k: 'Z', d: 'Undo' }, { k: 'S', d: 'Save' }, { k: 'F', d: 'Find' },
                                        { k: 'A', d: 'Select All' }, { k: 'P', d: 'Print' }
                                    ].map((sc, i) => (
                                        <li key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2">
                                                <KeyCap label="Ctrl" size="sm" /> 
                                                <span className="text-slate-400 dark:text-slate-600">+</span>
                                                <KeyCap label={sc.k} size="sm" />
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-800 border-dotted group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{sc.d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                         {/* Win Group */}
                         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                <KeyCap label="Win" size="sm" />
                                <h3 className="text-slate-900 dark:text-white font-bold ml-2">Windows Combinations</h3>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3">
                                    {[
                                        { k: 'E', d: 'File Explorer' }, { k: 'D', d: 'Show Desktop' },
                                        { k: 'L', d: 'Lock Computer' }, { k: 'Tab', d: 'Task View' },
                                        { k: 'S', d: 'Search' }, { k: 'I', d: 'Settings' }
                                    ].map((sc, i) => (
                                        <li key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2">
                                                <KeyCap label="Win" size="sm" /> 
                                                <span className="text-slate-400 dark:text-slate-600">+</span>
                                                <KeyCap label={sc.k} size="sm" />
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-800 border-dotted group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{sc.d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Alt Group */}
                         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                <KeyCap label="Alt" size="sm" />
                                <h3 className="text-slate-900 dark:text-white font-bold ml-2">Alt Combinations</h3>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3">
                                    {[
                                        { k: 'Tab', d: 'Switch App' }, { k: 'F4', d: 'Close App' },
                                        { k: 'Space', d: 'Window Menu' }, { k: 'Enter', d: 'Properties' }
                                    ].map((sc, i) => (
                                        <li key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2">
                                                <KeyCap label="Alt" size="sm" /> 
                                                <span className="text-slate-400 dark:text-slate-600">+</span>
                                                <KeyCap label={sc.k} size="sm" />
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-800 border-dotted group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">{sc.d}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'quiz',
            title: 'Test Your Knowledge',
            icon: CheckCircle,
            content: <GuideQuiz />
        }
    ];

    const activeSection = sections[activeSectionIndex];

    const nextSection = () => {
        if (activeSectionIndex < sections.length - 1) {
            setActiveSectionIndex(prev => prev + 1);
        }
    };

    const prevSection = () => {
        if (activeSectionIndex > 0) {
            setActiveSectionIndex(prev => prev - 1);
        }
    };

    const handleNavigation = (index: number) => {
        if (viewMode === 'step-by-step') {
            setActiveSectionIndex(index);
            setIsSidebarOpen(false);
        } else {
            const sectionId = sections[index].id;
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setIsSidebarOpen(false);
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh] relative">
            
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden mb-4">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="flex items-center gap-2 w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium active:scale-95 transition-transform shadow-sm"
                >
                    <Menu className="w-5 h-5" />
                    <span>Table of Contents</span>
                    <span className="ml-auto text-slate-500 dark:text-slate-400 text-sm">
                        {viewMode === 'step-by-step' ? activeSection.title : 'Overview'}
                    </span>
                </button>
            </div>

            {/* Sidebar / Table of Contents */}
            <aside className={`
                fixed inset-0 z-50 lg:static lg:z-auto
                bg-white/95 dark:bg-slate-950/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none
                flex flex-col w-full lg:w-72 shrink-0
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 lg:p-0 h-full overflow-y-auto">
                    <div className="flex items-center justify-between lg:hidden mb-8">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">Contents</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-900 dark:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sticky top-24 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Guide Sections</h3>
                        <nav className="space-y-1">
                            {sections.map((section, index) => {
                                const Icon = section.icon;
                                const isActive = viewMode === 'step-by-step' && activeSectionIndex === index;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => handleNavigation(index)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                                            ${isActive 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/20' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`} />
                                        <span className="font-medium text-sm">{section.title}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-200" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                <div className="bg-white/50 dark:bg-slate-950 rounded-3xl min-h-full flex flex-col">
                    
                    {/* View Toggle */}
                    <div className="p-4 sm:p-6 pb-0 flex justify-end">
                        <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setViewMode('single-page')}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                    ${viewMode === 'single-page' 
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
                                `}
                            >
                                <ScrollText className="w-3.5 h-3.5" />
                                Single Page
                            </button>
                            <button
                                onClick={() => setViewMode('step-by-step')}
                                className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                    ${viewMode === 'step-by-step' 
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
                                `}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                Step by Step
                            </button>
                        </div>
                    </div>

                    {/* Content Logic */}
                    <div className="flex-1 py-8 px-4 sm:px-0">
                        {viewMode === 'step-by-step' ? (
                            // Step by Step View
                            <>
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    {activeSection.content}
                                </div>
                                {/* Navigation Footer */}
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12">
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                        <button
                                            onClick={prevSection}
                                            disabled={activeSectionIndex === 0}
                                            className={`
                                                flex items-center gap-3 px-6 py-4 rounded-xl border transition-all text-sm font-medium
                                                ${activeSectionIndex === 0 
                                                    ? 'opacity-0 pointer-events-none' 
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}
                                            `}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <div className="text-left">
                                                <div className="text-xs text-slate-500 mb-0.5">Previous</div>
                                                <div>{sections[activeSectionIndex - 1]?.title}</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={nextSection}
                                            disabled={activeSectionIndex === sections.length - 1}
                                            className={`
                                                flex items-center justify-end gap-3 px-6 py-4 rounded-xl border transition-all text-sm font-medium
                                                ${activeSectionIndex === sections.length - 1
                                                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500' 
                                                    : 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/20 hover:bg-indigo-500'}
                                            `}
                                        >
                                            <div className="text-right">
                                                <div className="text-xs text-indigo-100 dark:text-indigo-200 mb-0.5">Next</div>
                                                <div>{sections[activeSectionIndex + 1]?.title || 'Finish'}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Single Page Scroll View
                            <div className="space-y-24">
                                {sections.map((section, idx) => (
                                    <div key={section.id} id={section.id} className="scroll-mt-24">
                                        {idx > 0 && <div className="h-px bg-slate-200 dark:bg-slate-800 mb-16 mx-auto max-w-2xl" />}
                                        {section.content}
                                    </div>
                                ))}
                                {/* Footer for end of scroll view */}
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-slate-900 dark:text-white font-medium">End of Guide</h3>
                                    <button 
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
                                    >
                                        Scroll to top
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};