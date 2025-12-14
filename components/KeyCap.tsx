import React from 'react';

interface KeyCapProps {
    label: string;
    variant?: 'default' | 'modifier' | 'action';
    size?: 'sm' | 'md';
    className?: string;
}

export const KeyCap: React.FC<KeyCapProps> = ({ label, variant = 'default', size = 'md', className = '' }) => {
    
    const getWidthClass = (lbl: string) => {
        if (lbl.length > 5) return 'min-w-[4rem] px-2'; // Space, Escape, etc
        if (lbl.length > 1) return 'min-w-[2.5rem] px-1.5'; // Ctrl, Alt, Tab
        return 'w-8 sm:w-10'; // Single letters
    };

    const baseStyles = "relative inline-flex items-center justify-center font-mono font-bold rounded-lg transition-transform active:translate-y-0.5 active:shadow-none select-none";
    
    // Style mimicking a physical key with 3D effect via border-b
    // Adjusted colors to look good in both light mode (on white/slate-50) and dark mode (on slate-900)
    const variants = {
        default: "bg-white dark:bg-slate-100 text-slate-700 dark:text-slate-800 border-b-4 border-slate-300 shadow-sm ring-1 ring-slate-900/5",
        modifier: "bg-indigo-600 text-white border-b-4 border-indigo-800 shadow-sm", // Ctrl, Alt, Shift
        action: "bg-emerald-600 text-white border-b-4 border-emerald-800 shadow-sm" // Enter, Arrows
    };

    const sizeStyles = size === 'sm' ? 'h-7 text-xs' : 'h-8 sm:h-10 text-sm sm:text-base';
    
    // Determine variant based on label content if not explicitly provided
    let computedVariant = variant;
    if (variant === 'default') {
        if (['Ctrl', 'Cmd', 'Alt', 'Shift', 'Win', 'Option', 'Fn'].includes(label)) computedVariant = 'modifier';
        if (['Enter', 'Tab', 'Esc', 'Space', 'Delete', 'Backspace'].includes(label)) computedVariant = 'action';
    }

    // Handle symbols mapping for aesthetics
    const displayLabel = label === 'Win' ? '⊞ Win' 
        : label === 'Cmd' ? '⌘ Cmd' 
        : label === 'Shift' ? '⇧ Shift'
        : label === 'Option' ? '⌥ Opt'
        : label === 'Arrow' ? '←↕→'
        : label === 'Left' ? '←'
        : label === 'Right' ? '→'
        : label === 'Up' ? '↑'
        : label === 'Down' ? '↓'
        : label;

    return (
        <kbd className={`${baseStyles} ${variants[computedVariant]} ${getWidthClass(label)} ${sizeStyles} ${className}`}>
            {displayLabel}
        </kbd>
    );
};