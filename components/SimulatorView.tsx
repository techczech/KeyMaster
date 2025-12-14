import React, { useState } from 'react';
import { Platform } from '../types';
import { TextNavLevel } from './TextNavLevel';
import { OutlineLevel } from './OutlineLevel';
import { 
    MousePointer2, 
    Indent, 
    Heading1, 
    Monitor, 
    AppWindow, 
    Trophy,
    CheckCircle2
} from 'lucide-react';

interface SimulatorViewProps {
    platform: Platform;
    onPlatformChange: (p: Platform) => void;
}

type Level = 'nav' | 'indent' | 'heading' | 'test';

export const SimulatorView: React.FC<SimulatorViewProps> = ({ platform, onPlatformChange }) => {
    const [level, setLevel] = useState<Level>('nav');

    // Detect platform on mount only if generic
    React.useEffect(() => {
        if (platform === Platform.BOTH || (platform !== Platform.MAC && platform !== Platform.WINDOWS)) {
             const isMac = navigator.userAgent.toLowerCase().includes('mac');
             onPlatformChange(isMac ? Platform.MAC : Platform.WINDOWS);
        }
    }, []);

    const renderTabs = () => (
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
            <button
                onClick={() => setLevel('nav')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${level === 'nav' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <MousePointer2 className="w-4 h-4" />
                Level 1: Navigation
            </button>
            <button
                onClick={() => setLevel('indent')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${level === 'indent' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Indent className="w-4 h-4" />
                Level 2: Indentation
            </button>
            <button
                onClick={() => setLevel('heading')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${level === 'heading' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Heading1 className="w-4 h-4" />
                Level 3: Structure
            </button>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="p-2 bg-emerald-500 rounded-lg text-white">
                            <Trophy className="w-6 h-6" />
                        </span>
                        Text Editor Simulator
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                        Put your mouse away. Practice real-world text editing scenarios in a controlled environment.
                    </p>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => onPlatformChange(Platform.WINDOWS)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${platform === Platform.WINDOWS ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        <Monitor className="w-4 h-4" /> Windows
                    </button>
                    <button 
                        onClick={() => onPlatformChange(Platform.MAC)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${platform === Platform.MAC ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        <AppWindow className="w-4 h-4" /> macOS
                    </button>
                </div>
            </div>

            {renderTabs()}

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                {level === 'nav' && <TextNavLevel platform={platform} />}
                {level === 'indent' && <OutlineLevel platform={platform} mode="indent" />}
                {level === 'heading' && <OutlineLevel platform={platform} mode="heading" />}
            </div>
        </div>
    );
};