import React, { useMemo } from 'react';
import { SHORTCUTS, CURATED_PLANS } from '../../constants';
import { Platform, Deck } from '../../types';
import { BookMarked, Layers, PackagePlus, CheckCircle2, Trash2, Play } from 'lucide-react';
import { KeyCap } from '../KeyCap';

interface PlanManagerProps {
    bookmarkedIds: string[];
    masteredIds: string[];
    platform: Platform;
    addBookmarks: (ids: string[]) => void;
    onClearAll: () => void;
    onStartPractice: (deckId: string) => void;
    onExit: () => void;
}

export const PlanManager: React.FC<PlanManagerProps> = ({ 
    bookmarkedIds, 
    masteredIds, 
    platform, 
    addBookmarks, 
    onClearAll,
    onStartPractice,
    onExit
}) => {
    
    // --- Data Derivation ---
    const allSavedShortcuts = useMemo(() => {
        return SHORTCUTS.filter(s => bookmarkedIds.includes(s.id));
    }, [bookmarkedIds]);

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

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <BookMarked className="w-8 h-8 text-indigo-500" />
                        Library & Decks
                    </h2>
                    <p className="text-slate-500 mt-2">Manage your collection and choose what to practice.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onClearAll}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                    <button onClick={onExit} className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">Back</button>
                </div>
            </div>

            {/* Available Decks */}
            {decks.length > 0 && (
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
                            };
                            const colorStyles = colorMap[deck.color] || colorMap['slate'];

                            return (
                                <div 
                                    key={deck.id}
                                    className={`relative group p-6 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col ${colorStyles}`}
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
                                    
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {deck.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 min-h-[2.5rem]">
                                        {deck.description || deck.subtitle || `${deck.shortcuts.length} shortcuts`}
                                    </p>

                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                                            <span>Mastery</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        
                                        <button 
                                            onClick={() => onStartPractice(deck.id)}
                                            className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" /> Practice
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Browse Packs */}
            <div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1 flex items-center gap-2">
                    <PackagePlus className="w-5 h-5 text-indigo-500" />
                    Browse Starter Packs
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
};