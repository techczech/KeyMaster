import React from 'react';

export enum Platform {
    WINDOWS = 'Windows',
    MAC = 'Mac',
    BOTH = 'Both'
}

export enum Category {
    GENERAL = 'General Control',
    TEXT_EDITING = 'Text Editing',
    WINDOW_MANAGEMENT = 'Window Management',
    FILE_EXPLORER = 'File Explorer',
    BROWSER = 'Web Browser',
    OUTLOOK = 'Outlook',
    SYSTEM = 'System & Settings',
    FUNCTION_KEYS = 'Function Keys',
    NAVIGATION = 'Navigation & Scrolling'
}

export interface Shortcut {
    id: string;
    keys: string[];
    description: string;
    category: Category;
    platform: Platform;
    note?: string;
    macKeys?: string[]; // If specifically different for Mac
}

export interface GuideSection {
    id: string;
    title: string;
    content: React.ReactNode;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export type AppView = 'landing' | 'search' | 'guide' | 'practice';

export interface Deck {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    icon?: React.ElementType;
    shortcuts: Shortcut[];
    color: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'blue' | 'slate' | 'rose';
    isCurated?: boolean;
}

export interface CuratedPlan {
    id: string;
    title: string;
    description: string;
    ids: readonly string[];
    color: Deck['color'];
    platforms: Platform[];
}

export interface LogEntry {
    id: string;
    shortcutDesc: string;
    result: 'correct' | 'skipped';
    timestamp: number;
}