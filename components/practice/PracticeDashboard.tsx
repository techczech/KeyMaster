import React from 'react';
import { 
    Terminal, 
    BookMarked, 
    Play, 
    Calendar as CalendarIcon, 
    Target,
    Zap,
    Trophy,
    Timer
} from 'lucide-react';
import { Platform } from '../../types';

interface PracticeDashboardProps {
    totalBookmarks: number;
    masteredCount: number;
    platform: Platform;
    onNavigate: (view: 'manager' | 'flashcards' | 'simulator' | 'test' | 'calendar') => void;
    onQuickPractice: () => void;
}

export const PracticeDashboard: React.FC<PracticeDashboardProps> = ({
    totalBookmarks,
    masteredCount,
    onNavigate,
    onQuickPractice
}) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-indigo-600 dark:bg-indigo-900/50 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-200 uppercase tracking-wider text-xs font-bold">
                            <Target className="w-4 h-4" /> Practice Hub
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Time to Train</h1>
                        <p className="text-indigo-100 max-w-xl text-lg">
                            Build muscle memory through varied activities. Track your progress and master your workflow.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{totalBookmarks}</div>
                            <div className="text-xs text-indigo-200 font-medium uppercase">Saved</div>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{masteredCount}</div>
                            <div className="text-xs text-indigo-200 font-medium uppercase">Mastered</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 0. Quick Practice (New) */}
                <div 
                    onClick={onQuickPractice}
                    className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                        <Timer className="w-6 h-6 fill-current" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400">Quick Practice</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[3rem]">
                        Short on time? Review 5 random cards from your library instantly.
                    </p>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Start 5 Cards <Play className="w-3 h-3" />
                    </span>
                </div>

                {/* 1. Flashcards (Quick Start) */}
                <div 
                    onClick={() => onNavigate('flashcards')}
                    className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Flashcards</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[3rem]">
                        Active recall practice for all your saved shortcuts.
                    </p>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Start Session <Play className="w-3 h-3" />
                    </span>
                </div>

                {/* 2. Simulator */}
                <div 
                    onClick={() => onNavigate('simulator')}
                    className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Text Simulator</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[3rem]">
                        Practice navigation, selection, and editing in a realistic text editor environment.
                    </p>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Open Simulator <Terminal className="w-3 h-3" />
                    </span>
                </div>

                {/* 3. Plan Manager */}
                <div 
                    onClick={() => onNavigate('manager')}
                    className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-6 group-hover:scale-110 transition-transform">
                        <BookMarked className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-200">Manage Plan</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[3rem]">
                        Organize your decks, browse starter packs, and manage your learning library.
                    </p>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View Library <BookMarked className="w-3 h-3" />
                    </span>
                </div>

                {/* 4. Skill Test */}
                <div 
                    onClick={() => onNavigate('test')}
                    className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400">Skill Assessment</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[3rem]">
                        Take a timed test to benchmark your speed and identify weak spots.
                    </p>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Take Test <Zap className="w-3 h-3" />
                    </span>
                </div>

                {/* 5. Calendar */}
                <div 
                    onClick={() => onNavigate('calendar')}
                    className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-1"
                >
                     <div className="flex flex-col items-start gap-6">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">Study Schedule</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 min-h-[3rem]">
                                Visualize your learning path goals.
                            </p>
                             <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                Open Calendar <CalendarIcon className="w-3 h-3" />
                            </span>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};