import React from 'react';

interface GoalProps {
    currentAmount: number;
    targetAmount: number;
    title: string;
}

const CalizProgress = ({ currentAmount, targetAmount, title }: GoalProps) => {
    const percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900 rounded-lg border border-amber-900/30">
            <h4 className="text-amber-400 font-serif mb-2">{title}</h4>

            {/* The Cáliz Container */}
            <div className="relative w-16 h-24 border-2 border-amber-600 rounded-b-2xl rounded-t-sm overflow-hidden bg-gray-800">
                {/* Liquid Fill */}
                <div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-amber-600 to-yellow-400 transition-all duration-1000 ease-in-out"
                    style={{ height: `${percentage}%` }}
                >
                    {/* Bubble Emitter (CSS only implementation for simplicity) */}
                    <div className="w-full h-full opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0id2hpdGUiIC8+Cjwvc3ZnPg==')] animate-pulse"></div>
                </div>

                {/* Reflection/Glass Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
            </div>

            <div className="mt-2 text-xs text-amber-200">
                ${currentAmount} / ${targetAmount}
            </div>
        </div>
    );
};

export default CalizProgress;
