import React, { useState } from 'react';
import { GUIDE_QUIZ_QUESTIONS } from '../constants';
import { CheckCircle2, XCircle, RotateCcw, Medal } from 'lucide-react';

export const GuideQuiz: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleAnswerClick = (optionIndex: number) => {
        if (isAnswered) return;

        setSelectedOption(optionIndex);
        setIsAnswered(true);

        if (optionIndex === GUIDE_QUIZ_QUESTIONS[currentIndex].correctIndex) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        const nextQuestion = currentIndex + 1;
        if (nextQuestion < GUIDE_QUIZ_QUESTIONS.length) {
            setCurrentIndex(nextQuestion);
            setIsAnswered(false);
            setSelectedOption(null);
        } else {
            setShowScore(true);
        }
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setScore(0);
        setShowScore(false);
        setIsAnswered(false);
        setSelectedOption(null);
    };

    if (showScore) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center animate-in fade-in zoom-in-95 duration-500 min-h-[400px]">
                <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
                    <Medal className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Completed!</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    You scored <span className="font-bold text-indigo-600 dark:text-indigo-400">{score}</span> out of <span className="font-bold">{GUIDE_QUIZ_QUESTIONS.length}</span>
                </p>
                <button
                    onClick={resetQuiz}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-105"
                >
                    <RotateCcw className="w-5 h-5" />
                    Retake Quiz
                </button>
            </div>
        );
    }

    const currentQuestion = GUIDE_QUIZ_QUESTIONS[currentIndex];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
            
            {/* Header / Progress */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Knowledge Check</h2>
                    <p className="text-slate-500 dark:text-slate-400">Test your understanding of the guide sections</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Question {currentIndex + 1}</span>
                    <span className="text-sm text-slate-400"> / {GUIDE_QUIZ_QUESTIONS.length}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${((currentIndex) / GUIDE_QUIZ_QUESTIONS.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        let buttonStyle = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800";
                        let icon = null;

                        if (isAnswered) {
                            if (index === currentQuestion.correctIndex) {
                                buttonStyle = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300";
                                icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
                            } else if (index === selectedOption) {
                                buttonStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-500/50 text-red-700 dark:text-red-300";
                                icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
                            } else {
                                buttonStyle = "opacity-50 border-slate-200 dark:border-slate-800";
                            }
                        } else if (selectedOption === index) {
                            buttonStyle = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerClick(index)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${buttonStyle}`}
                            >
                                <span className="font-medium">{option}</span>
                                {icon}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Section */}
                {isAnswered && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <div className="pr-4">
                                <p className={`font-bold mb-1 ${selectedOption === currentQuestion.correctIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {selectedOption === currentQuestion.correctIndex ? 'Correct!' : 'Incorrect'}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                            <button
                                onClick={handleNextQuestion}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                            >
                                {currentIndex === GUIDE_QUIZ_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};