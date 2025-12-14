import React from 'react';
import { Shortcut, Platform } from '../types';
import { KeyCap } from './KeyCap';
import { Monitor, AppWindow, Bookmark } from 'lucide-react';

interface ShortcutCardProps {
    shortcut: Shortcut;
    activePlatform: Platform;
    isBookmarked?: boolean;
    onToggleBookmark?: (id: string) => void;
}

export const ShortcutCard: React.FC<ShortcutCardProps> = ({ 
    shortcut, 
    activePlatform, 
    isBookmarked = false, 
    onToggleBookmark 
}) => {
    // Determine which keys to show based on platform preference
    const keysToShow = (activePlatform === Platform.MAC && shortcut.macKeys) 
        ? shortcut.macKeys 
        : shortcut.keys;

    // Check if we are showing Mac keys for this specific card
    const isShowingMac = activePlatform === Platform.MAC && !!shortcut.macKeys;

    return (
        <div className={`
            relative bg-white dark:bg-slate-800/50 backdrop-blur border rounded-xl p-4 sm:p-5 
            hover:shadow-md transition-all duration-300 group flex flex-col justify-between gap-4
            ${isBookmarked 
                ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 dark:border-indigo-400/50' 
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50'
            }
        `}>
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-transparent">
                        {shortcut.category}
                    </span>
                    
                    <div className="flex items-center gap-2 ml-2">
                        {shortcut.note && (
                            <span className="text-xs text-slate-500 italic text-right hidden xs:block">
                                {shortcut.note}
                            </span>
                        )}
                        {onToggleBookmark && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleBookmark(shortcut.id);
                                }}
                                className={`
                                    p-1 rounded-md transition-all duration-200
                                    ${isBookmarked 
                                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' 
                                        : 'text-slate-400 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }
                                `}
                                title={isBookmarked ? "Remove from plan" : "Add to learning plan"}
                            >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>
                <h3 className="text-slate-800 dark:text-slate-200 font-medium leading-tight pr-6">
                    {shortcut.description}
                </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
                {keysToShow.map((key, index) => (
                    <React.Fragment key={`${shortcut.id}-${index}`}>
                        <KeyCap label={key} />
                        {index < keysToShow.length - 1 && (
                            <span className="text-slate-400 dark:text-slate-600 font-bold text-lg px-0.5">+</span>
                        )}
                    </React.Fragment>
                ))}
                
                {/* Platform indicator if needed */}
                <div 
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    title={isShowingMac ? "Mac Shortcut" : "Windows Shortcut"}
                >
                    {isShowingMac ? (
                        <AppWindow className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                        <Monitor className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                </div>
            </div>
        </div>
    );
};