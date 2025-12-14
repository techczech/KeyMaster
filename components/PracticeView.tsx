import React, { useState } from 'react';
import { Platform } from '../types';
import { PracticeDashboard } from './practice/PracticeDashboard';
import { PlanManager } from './practice/PlanManager';
import { FlashcardSession } from './practice/FlashcardSession';
import { StudyCalendar } from './practice/StudyCalendar';
import { SimulatorView } from './SimulatorView';
import { SkillTestView } from './SkillTestView';
import { SHORTCUTS } from '../constants';

export type PracticeMode = 'hub' | 'manager' | 'flashcards' | 'simulator' | 'test' | 'calendar';

interface PracticeViewProps {
    bookmarkedIds: string[];
    masteredIds: string[];
    platform: Platform;
    initialMode?: PracticeMode;
    onPlatformChange: (platform: Platform) => void;
    addBookmarks: (ids: string[]) => void;
    onMarkMastered: (id: string | string[]) => void;
    onClearAll: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
    bookmarkedIds,
    masteredIds,
    platform,
    initialMode = 'hub',
    onPlatformChange,
    addBookmarks,
    onMarkMastered,
    onClearAll
}) => {
    const [mode, setMode] = useState<PracticeMode>(initialMode);
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
    const [quickPracticeIds, setQuickPracticeIds] = useState<string[]>([]);

    // Helpers
    const handleTestComplete = (results: { mastered: string[], practice: string[] }) => {
        onMarkMastered(results.mastered);
        addBookmarks(results.practice);
        setMode('hub');
    };

    const handleQuickPractice = () => {
        // Find bookmarks that are NOT mastered
        const available = SHORTCUTS.filter(s => bookmarkedIds.includes(s.id) && !masteredIds.includes(s.id));
        
        // Shuffle and pick 5
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5).map(s => s.id);
        
        if (selected.length === 0) {
            alert("No pending shortcuts to practice! Add some bookmarks or clear your mastery progress.");
            return;
        }

        setQuickPracticeIds(selected);
        setActiveDeckId('quick');
        setMode('flashcards');
    };

    return (
        <div className="min-h-[600px]">
            {mode === 'hub' && (
                <PracticeDashboard 
                    totalBookmarks={bookmarkedIds.length}
                    masteredCount={masteredIds.length}
                    platform={platform}
                    onNavigate={(m) => setMode(m)}
                    onQuickPractice={handleQuickPractice}
                />
            )}

            {mode === 'manager' && (
                <PlanManager 
                    bookmarkedIds={bookmarkedIds}
                    masteredIds={masteredIds}
                    platform={platform}
                    addBookmarks={addBookmarks}
                    onClearAll={onClearAll}
                    onStartPractice={(id) => {
                        setActiveDeckId(id);
                        setMode('flashcards');
                    }}
                    onExit={() => setMode('hub')}
                />
            )}

            {mode === 'flashcards' && (
                <FlashcardSession 
                    bookmarkedIds={bookmarkedIds}
                    masteredIds={masteredIds}
                    platform={platform}
                    deckId={activeDeckId}
                    customQueueIds={activeDeckId === 'quick' ? quickPracticeIds : undefined}
                    onMarkMastered={(id) => onMarkMastered(id)}
                    onExit={() => {
                        setActiveDeckId(null);
                        setMode('hub');
                    }}
                />
            )}

            {mode === 'calendar' && (
                <StudyCalendar 
                    bookmarkedIds={bookmarkedIds}
                    masteredIds={masteredIds}
                    platform={platform}
                    onExit={() => setMode('hub')}
                />
            )}

            {mode === 'simulator' && (
                <div>
                     <button 
                        onClick={() => setMode('hub')}
                        className="mb-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        Back to Hub
                    </button>
                    <SimulatorView 
                        platform={platform} 
                        onPlatformChange={onPlatformChange} 
                    />
                </div>
            )}

            {mode === 'test' && (
                <SkillTestView 
                    platform={platform} 
                    onPlatformChange={onPlatformChange}
                    onComplete={handleTestComplete}
                    onExit={() => setMode('hub')}
                />
            )}
        </div>
    );
};