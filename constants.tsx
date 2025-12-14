import React from 'react';
import { Shortcut, Category, Platform, QuizQuestion, CuratedPlan } from './types';

// IDs used for the "Essentials" plan and the "Take a Test" feature
export const ESSENTIAL_IDS = ['cc-1', 'cc-3', 'cc-4', 'cc-6', 'cc-7', 'win-1', 'win-2', 'sys-1'];

export const CURATED_PLANS: CuratedPlan[] = [
    {
        id: 'essentials',
        title: "The Essentials",
        description: "Must-know shortcuts for every computer user. Copy, paste, undo, and save.",
        ids: ESSENTIAL_IDS,
        color: "indigo",
        platforms: [Platform.WINDOWS, Platform.MAC]
    },
    {
        id: 'text-wizard',
        title: "Text Editing Wizard",
        description: "Edit text faster than you can type. Navigation, selection, and formatting.",
        ids: ['txt-2', 'txt-3', 'txt-4', 'txt-5', 'txt-1', 'cc-2', 'cc-5'],
        color: "emerald",
        platforms: [Platform.WINDOWS, Platform.MAC]
    },
    {
        id: 'window-manager',
        title: "Window Manager",
        description: "Control your digital workspace efficiently. Switch, snap, and show desktop.",
        ids: ['win-1', 'win-2', 'win-3', 'win-4', 'win-5', 'sys-2'],
        color: "amber",
        platforms: [Platform.WINDOWS]
    },
    {
        id: 'browser-pro',
        title: "Browser Pro",
        description: "Surf the web without the mouse. Tab management and navigation.",
        ids: ['web-2', 'web-3', 'web-4', 'web-5', 'web-1', 'web-6'],
        color: "cyan",
        platforms: [Platform.WINDOWS, Platform.MAC]
    },
    {
        id: 'outlook-power',
        title: "Outlook Power User",
        description: "Triage emails, reply, and organize your calendar without touching the mouse.",
        ids: ['out-1', 'out-2', 'out-3', 'out-4', 'out-5', 'out-6', 'out-7'],
        color: "blue",
        platforms: [Platform.WINDOWS, Platform.MAC]
    }
];

export const UNCAPTURABLE_GUIDE_DATA = {
    mac: [
        { category: "App & System", keys: ["Cmd+Q", "Cmd+Tab", "Cmd+Space", "Cmd+H", "Cmd+Option+Esc"], desc: "Quitting, Switching Apps, Spotlight, Hiding" },
        { category: "Browser Control", keys: ["Cmd+W", "Cmd+N", "Cmd+T", "Cmd+L", "Cmd+R"], desc: "Closing tabs, New windows, Address bar, Reload" },
        { category: "Mission Control", keys: ["Ctrl+Arrows", "F3", "F4"], desc: "Spaces, Mission Control, Launchpad" },
        { category: "System", keys: ["Cmd+Shift+3/4/5", "Eject", "Power"], desc: "Screenshots, Power controls" }
    ],
    windows: [
        { category: "Window Management", keys: ["Alt+F4", "Alt+Tab", "Alt+Space", "Win+D"], desc: "Close window, Switch apps, Desktop" },
        { category: "System Shell", keys: ["Win Key", "Win+L", "Win+X", "Ctrl+Alt+Del"], desc: "Start Menu, Lock Screen, Admin Menu, Security" },
        { category: "Browser Control", keys: ["Ctrl+W", "Ctrl+T", "Ctrl+N", "F5", "F11"], desc: "Close tab, New tab, Reload, Fullscreen" },
        { category: "Accessibility", keys: ["Win+Plus", "Win+Enter"], desc: "Magnifier, Narrator" }
    ]
};

export const GUIDE_QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 'q1',
        question: "According to the guide, what is the best way to think about learning keyboard shortcuts?",
        options: [
            "Memorizing a dictionary",
            "Learning idioms in a foreign language",
            "Solving mathematical equations",
            "Reading a strict rulebook"
        ],
        correctIndex: 1,
        explanation: "The guide compares shortcuts to idioms - initially arbitrary connections that you become fluent in over time."
    },
    {
        id: 'q2',
        question: "Which of these is NOT listed as a 'Standalone Function' control key?",
        options: [
            "Esc",
            "Enter",
            "Ctrl",
            "Arrow Keys"
        ],
        correctIndex: 2,
        explanation: "Ctrl (Control) is a Combination Key (Type 2) that modifies other keys, unlike Esc or Enter which act immediately."
    },
    {
        id: 'q3',
        question: "On MacOS, which key usually performs the functions of 'Ctrl' on Windows?",
        options: [
            "Option",
            "Control",
            "Fn",
            "Command (Cmd)"
        ],
        correctIndex: 3,
        explanation: "The Command (Cmd) key on Mac is the primary equivalent to Windows Ctrl for shortcuts like Copy (Cmd+C) and Save (Cmd+S)."
    },
    {
        id: 'q4',
        question: "What is the common behavior of the 'Tab' key in a dialog or form?",
        options: [
            "It closes the window",
            "It moves to the next screen element",
            "It prints the document",
            "It opens the start menu"
        ],
        correctIndex: 1,
        explanation: "Tab is universally used to move focus to the next interactive element (input, button, link)."
    },
    {
        id: 'q5',
        question: "How should you physically press a combination like Ctrl + C?",
        options: [
            "Press both exactly at the same time",
            "Press C first, then Ctrl",
            "Press and hold Ctrl, press C, release both",
            "Tap Ctrl, wait a second, then tap C"
        ],
        correctIndex: 2,
        explanation: "The correct modifier sequence is: Hold Modifier -> Press Action Key -> Release Both."
    }
];

// The guide content is now moved to components/GuideView.tsx to keep this file focused on data
// We have significantly expanded this list based on the user's provided text

export const SHORTCUTS: Shortcut[] = [
    // --- Common Control Keys ---
    { id: 'cc-1', keys: ['Ctrl', 'C'], description: 'Copy selected item', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'C'] },
    { id: 'cc-2', keys: ['Ctrl', 'X'], description: 'Cut selected item', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'X'] },
    { id: 'cc-3', keys: ['Ctrl', 'V'], description: 'Paste content', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'V'] },
    { id: 'cc-4', keys: ['Ctrl', 'Z'], description: 'Undo action', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Z'] },
    { id: 'cc-5', keys: ['Ctrl', 'Y'], description: 'Redo action', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Shift', 'Z'] },
    { id: 'cc-6', keys: ['Ctrl', 'A'], description: 'Select all', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'A'] },
    { id: 'cc-7', keys: ['Ctrl', 'S'], description: 'Save', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'S'] },
    { id: 'cc-8', keys: ['Ctrl', 'P'], description: 'Print', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'P'] },
    { id: 'cc-9', keys: ['Ctrl', 'F'], description: 'Find', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'F'] },
    { id: 'cc-10', keys: ['Ctrl', 'O'], description: 'Open file', category: Category.GENERAL, platform: Platform.WINDOWS, macKeys: ['Cmd', 'O'] },
    
    // --- Text Editing & Navigation ---
    { id: 'txt-1', keys: ['Ctrl', 'B'], description: 'Bold text', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Cmd', 'B'] },
    { id: 'txt-2', keys: ['Ctrl', 'Arrow'], description: 'Move cursor by word', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Option', 'Arrow'] },
    { id: 'txt-3', keys: ['Ctrl', 'Shift', 'Arrow'], description: 'Select word', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Option', 'Shift', 'Arrow'] },
    { id: 'txt-4', keys: ['Home'], description: 'Go to beginning of line', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Left'] },
    { id: 'txt-5', keys: ['End'], description: 'Go to end of line', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Right'] },
    { id: 'txt-6', keys: ['Ctrl', 'Home'], description: 'Go to beginning of document', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Up'] },
    { id: 'txt-7', keys: ['Ctrl', 'End'], description: 'Go to end of document', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Down'] },
    { id: 'txt-8', keys: ['Insert'], description: 'Toggle Insert/Overwrite mode', category: Category.TEXT_EDITING, platform: Platform.WINDOWS },
    { id: 'txt-9', keys: ['Delete'], description: 'Delete next character/item', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, macKeys: ['Fn', 'Delete'] },
    
    // --- Window Management ---
    { id: 'win-1', keys: ['Alt', 'Tab'], description: 'Switch between open applications', category: Category.WINDOW_MANAGEMENT, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Tab'] },
    { id: 'win-2', keys: ['Alt', 'F4'], description: 'Close current application', category: Category.WINDOW_MANAGEMENT, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Q'] },
    { id: 'win-3', keys: ['Win', 'Tab'], description: 'Open Task View', category: Category.WINDOW_MANAGEMENT, platform: Platform.WINDOWS, note: 'Virtual Desktops' },
    { id: 'win-4', keys: ['Win', 'D'], description: 'Show or hide desktop', category: Category.WINDOW_MANAGEMENT, platform: Platform.WINDOWS, note: 'Minimizes/Restores all' },
    { id: 'win-5', keys: ['Win', 'L'], description: 'Lock the computer', category: Category.SYSTEM, platform: Platform.WINDOWS },
    { id: 'win-6', keys: ['Win', 'M'], description: 'Minimize all windows', category: Category.WINDOW_MANAGEMENT, platform: Platform.WINDOWS },
    { id: 'win-7', keys: ['Alt', 'Space'], description: 'Window menu (Restore/Move/Size)', category: Category.WINDOW_MANAGEMENT, platform: Platform.WINDOWS },
    { id: 'win-8', keys: ['Alt', 'Enter'], description: 'Display properties for selected item', category: Category.WINDOW_MANAGEMENT, platform: Platform.WINDOWS, macKeys: ['Cmd', 'I'] },

    // --- System ---
    { id: 'sys-1', keys: ['Win'], description: 'Open Search/Start', category: Category.SYSTEM, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Space'] },
    { id: 'sys-2', keys: ['Win', 'E'], description: 'Open File Explorer', category: Category.FILE_EXPLORER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Space'] },
    { id: 'sys-3', keys: ['Win', 'R'], description: 'Open Run dialog', category: Category.SYSTEM, platform: Platform.WINDOWS },
    { id: 'sys-4', keys: ['Win', 'I'], description: 'Open Settings', category: Category.SYSTEM, platform: Platform.WINDOWS, macKeys: ['Cmd', ','] },
    { id: 'sys-5', keys: ['Win', 'A'], description: 'Open Action Center', category: Category.SYSTEM, platform: Platform.WINDOWS },
    { id: 'sys-6', keys: ['F2'], description: 'Rename selected file', category: Category.FILE_EXPLORER, platform: Platform.WINDOWS, macKeys: ['Enter'] },
    
    // --- Browser ---
    { id: 'web-1', keys: ['Alt', 'D'], description: 'Focus Address Bar', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'L'] },
    { id: 'web-2', keys: ['Ctrl', 'T'], description: 'New Tab', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'T'] },
    { id: 'web-3', keys: ['Ctrl', 'W'], description: 'Close Current Tab', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'W'] },
    { id: 'web-4', keys: ['Ctrl', 'Tab'], description: 'Next Tab', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Option', 'Right'] },
    { id: 'web-5', keys: ['Ctrl', 'Shift', 'Tab'], description: 'Previous Tab', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Option', 'Left'] },
    { id: 'web-6', keys: ['F5'], description: 'Refresh Page', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'R'] },
    { id: 'web-7', keys: ['Ctrl', 'H'], description: 'Open History', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Y'] },
    { id: 'web-8', keys: ['Ctrl', 'J'], description: 'Open Downloads', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Option', 'L'] },
    { id: 'web-9', keys: ['F11'], description: 'Toggle Fullscreen', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Ctrl', 'Cmd', 'F'] },
    { id: 'web-10', keys: ['F12'], description: 'Developer Tools', category: Category.BROWSER, platform: Platform.WINDOWS },
    { id: 'web-11', keys: ['Alt', 'Left'], description: 'Go Back', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Left'] },
    { id: 'web-12', keys: ['Alt', 'Right'], description: 'Go Forward', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Right'] },
    { id: 'web-13', keys: ['Ctrl', 'Shift', 'T'], description: 'Reopen Closed Tab', category: Category.BROWSER, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Shift', 'T'] },

    // --- Outlook / Office ---
    { id: 'out-1', keys: ['Ctrl', 'N'], description: 'New Email', category: Category.OUTLOOK, platform: Platform.WINDOWS, macKeys: ['Cmd', 'N'] },
    { id: 'out-2', keys: ['Alt', 'S'], description: 'Send Email', category: Category.OUTLOOK, platform: Platform.WINDOWS },
    { id: 'out-3', keys: ['Ctrl', 'R'], description: 'Reply', category: Category.OUTLOOK, platform: Platform.WINDOWS, macKeys: ['Cmd', 'R'] },
    { id: 'out-4', keys: ['Ctrl', 'Shift', 'R'], description: 'Reply All', category: Category.OUTLOOK, platform: Platform.WINDOWS, macKeys: ['Cmd', 'Shift', 'R'] },
    { id: 'out-5', keys: ['Ctrl', 'F'], description: 'Forward', category: Category.OUTLOOK, platform: Platform.WINDOWS, macKeys: ['Cmd', 'J'] },
    { id: 'out-6', keys: ['Ctrl', '1'], description: 'Go to Mail View', category: Category.OUTLOOK, platform: Platform.WINDOWS, macKeys: ['Cmd', '1'] },
    { id: 'out-7', keys: ['Ctrl', '2'], description: 'Go to Calendar View', category: Category.OUTLOOK, platform: Platform.WINDOWS, macKeys: ['Cmd', '2'] },
    { id: 'out-8', keys: ['Ctrl', 'H'], description: 'Find and Replace', category: Category.TEXT_EDITING, platform: Platform.WINDOWS, note: 'Microsoft Word' },

    // --- Function Keys ---
    { id: 'fn-1', keys: ['F1'], description: 'Help', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-2', keys: ['F2'], description: 'Rename/Edit', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-3', keys: ['F3'], description: 'Search', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-4', keys: ['Alt', 'F4'], description: 'Close App / Shutdown', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-5', keys: ['F5'], description: 'Refresh', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-6', keys: ['F6'], description: 'Move between regions', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-7', keys: ['F7'], description: 'Spell/Grammar Check', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS, note: 'Word/Office' },
    { id: 'fn-8', keys: ['F8'], description: 'Safe Mode / Macros', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-9', keys: ['F9'], description: 'Update fields', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS, note: 'Word/Excel' },
    { id: 'fn-10', keys: ['F10'], description: 'Activate Menu Bar', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-11', keys: ['Shift', 'F10'], description: 'Right Click', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-12', keys: ['F11'], description: 'Fullscreen Mode', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS },
    { id: 'fn-13', keys: ['F12'], description: 'Save As', category: Category.FUNCTION_KEYS, platform: Platform.WINDOWS, note: 'Word/Excel' },

    // --- Navigation & Full Keyboard ---
    { id: 'nav-1', keys: ['Page Up'], description: 'Scroll up by page', category: Category.NAVIGATION, platform: Platform.WINDOWS },
    { id: 'nav-2', keys: ['Page Down'], description: 'Scroll down by page', category: Category.NAVIGATION, platform: Platform.WINDOWS },
    { id: 'nav-3', keys: ['Ctrl', 'Page Up'], description: 'Previous Tab/Worksheet', category: Category.NAVIGATION, platform: Platform.WINDOWS },
    { id: 'nav-4', keys: ['Ctrl', 'Page Down'], description: 'Next Tab/Worksheet', category: Category.NAVIGATION, platform: Platform.WINDOWS },
    { id: 'nav-5', keys: ['Tab'], description: 'Move focus to next item', category: Category.NAVIGATION, platform: Platform.WINDOWS },
    { id: 'nav-6', keys: ['Shift', 'Tab'], description: 'Move focus to previous item', category: Category.NAVIGATION, platform: Platform.WINDOWS },
];