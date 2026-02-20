'use client';

import { useState } from 'react';

export default function AdminDashboard({ isVisible }: { isVisible: boolean }) {
    if (!isVisible) return null;

    return (
        <div className="fixed top-24 left-6 z-40">
            <div className="bg-surface border border-mustard rounded-lg shadow-2xl p-4 w-64">
                <div className="flex items-center space-x-2 mb-4 border-b border-gray-700 pb-2">
                    <span className="text-2xl">⚡</span>
                    <h2 className="text-lg font-bold text-mustard">GOD MODE</h2>
                </div>

                <div className="space-y-4">
                    {/* Rank Control */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">GLOBAL RANK MULTIPLIER</label>
                        <div className="flex items-center space-x-2">
                            <input type="range" min="1" max="100" className="w-full accent-mustard" />
                            <span className="text-sm font-mono text-cream">MAX</span>
                        </div>
                    </div>

                    {/* Prize Drop */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">PRIZE SYSTEM</label>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded flex items-center justify-center space-x-1">
                            <span>🎁</span>
                            <span>Trigger Global Airdrop</span>
                        </button>
                    </div>

                    {/* System Status */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">SYSTEM STATUS</label>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-400">Rapper Agent: ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
