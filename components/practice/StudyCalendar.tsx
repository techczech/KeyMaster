import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Clock } from 'lucide-react';
import { SHORTCUTS } from '../../constants';
import { Platform } from '../../types';
import { KeyCap } from '../KeyCap';

interface StudyCalendarProps {
    bookmarkedIds: string[];
    masteredIds: string[];
    platform: Platform;
    onExit: () => void;
}

export const StudyCalendar: React.FC<StudyCalendarProps> = ({ bookmarkedIds, masteredIds, platform, onExit }) => {
    
    // Config
    const ITEMS_PER_DAY = 5;

    const { days, totalDays, masteredCount, remainingCount } = useMemo(() => {
        // Filter only shortcuts in the plan
        const planShortcuts = SHORTCUTS.filter(s => bookmarkedIds.includes(s.id));
        const notMastered = planShortcuts.filter(s => !masteredIds.includes(s.id));
        
        const chunks = [];
        for (let i = 0; i < notMastered.length; i += ITEMS_PER_DAY) {
            chunks.push(notMastered.slice(i, i + ITEMS_PER_DAY));
        }

        return {
            days: chunks,
            totalDays: chunks.length,
            masteredCount: planShortcuts.length - notMastered.length,
            remainingCount: notMastered.length
        };
    }, [bookmarkedIds, masteredIds]);

    const getKeys = (s: any) => (platform === Platform.MAC && s.macKeys) ? s.macKeys : s.keys;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-blue-500" />
                        Study Schedule
                    </h2>
                    <p className="text-slate-500 mt-2">
                        Based on <strong className="text-slate-900 dark:text-white">{ITEMS_PER_DAY} items</strong> per day.
                    </p>
                </div>
                <button onClick={onExit} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">Back</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{masteredCount}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Completed</div>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Circle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{remainingCount}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Remaining</div>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalDays} Days</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Estimated Time</div>
                    </div>
                 </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                {days.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-dashed border-2 border-slate-200 dark:border-slate-800">
                         <p className="text-slate-500">No pending items! You are all caught up.</p>
                    </div>
                )}

                {days.map((chunk, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                        {idx === 0 && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Next Up</div>}
                        
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm">{idx + 1}</span>
                            Day {idx + 1}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {chunk.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.description}</span>
                                    <div className="flex gap-1 scale-90 origin-right">
                                        {getKeys(s).map((k: string, i: number) => (
                                            <KeyCap key={i} label={k} size="sm" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};