'use client';

import { useState } from 'react';

export default function AdminDashboard() {
    const [calizLevel, setCalizLevel] = useState(1250);
    const [calizTarget] = useState(5000);
    const [isInjecting, setIsInjecting] = useState(false);

    const handleInjectFunds = async (amount: number) => {
        setIsInjecting(true);
        try {
            const resp = await fetch("https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1/update-caliz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chefId: "flowchef_rapper",
                    amountToAdd: amount
                })
            });

            if (!resp.ok) {
                console.error("Failed to inject funds");
                return;
            }

            const data = await resp.json();
            if (data.success && data.newAmount !== undefined) {
                setCalizLevel(data.newAmount);
            } else if (data.success && data.goal) {
                setCalizLevel(data.goal.current_amount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsInjecting(false);
        }
    };

    const progressPercent = Math.min((calizLevel / calizTarget) * 100, 100).toFixed(1);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-neutral-900 border border-amber-600 rounded-lg shadow-2xl p-6">
                <div className="flex items-center space-x-2 mb-6 border-b border-gray-700 pb-4">
                    <span className="text-3xl">⚡</span>
                    <h2 className="text-2xl font-bold text-amber-500">GOD MODE DASHBOARD</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Rank Control */}
                    <div className="p-4 border border-neutral-700 rounded bg-neutral-950">
                        <label className="block text-xs text-gray-400 mb-2 font-bold tracking-wider">GLOBAL RANK MULTIPLIER</label>
                        <div className="flex items-center space-x-2">
                            <input type="range" min="1" max="100" className="w-full accent-amber-500" />
                            <span className="text-sm font-mono text-amber-200">MAX</span>
                        </div>
                    </div>

                    {/* Prize Drop */}
                    <div className="p-4 border border-neutral-700 rounded bg-neutral-950">
                        <label className="block text-xs text-gray-400 mb-2 font-bold tracking-wider">PRIZE SYSTEM</label>
                        <button className="w-full bg-indigo-900 hover:bg-indigo-800 text-white text-sm py-2 rounded flex items-center justify-center space-x-2 transition-colors border border-indigo-700">
                            <span>🎁</span>
                            <span>Trigger Global Airdrop</span>
                        </button>
                    </div>

                    {/* System Status */}
                    <div className="p-4 border border-neutral-700 rounded bg-neutral-950">
                        <label className="block text-xs text-gray-400 mb-2 font-bold tracking-wider">SYSTEM STATUS</label>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                            <span className="text-xs text-green-400 font-mono">RAPPER AGENT: ONLINE</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                            <span className="text-xs text-green-400 font-mono">SUPABASE: CONNECTED</span>
                        </div>
                    </div>

                    {/* Cáliz Control */}
                    <div className="p-4 border border-neutral-700 rounded bg-neutral-950 md:col-span-3">
                        <label className="block text-xs text-gray-400 mb-2 font-bold tracking-wider text-amber-500">🏆 CÁLIZ MASTER CONTROL</label>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex-1 w-full bg-black border border-amber-900/50 rounded p-3 flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-gray-500 block">CURRENT CÁLIZ LEVEL</span>
                                    <span className="text-xl font-bold text-amber-400">
                                        ${calizLevel.toLocaleString()} / ${calizTarget.toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block">PROGRESS</span>
                                    <span className="text-xl font-bold text-green-400">{progressPercent}%</span>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => handleInjectFunds(100)}
                                    disabled={isInjecting}
                                    className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm py-3 px-6 rounded transition-colors shadow-[0_0_15px_rgba(217,119,6,0.5)] disabled:opacity-50"
                                >
                                    + ADD $100
                                </button>
                                <button
                                    onClick={() => handleInjectFunds(5000)}
                                    disabled={isInjecting}
                                    className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3 px-6 rounded transition-colors shadow-[0_0_15px_rgba(79,70,229,0.5)] disabled:opacity-50"
                                >
                                    🚀 FULL SEND
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 font-mono">
                            Injects simulated funds directly into the flowchef_rapper active goal. Real-time updates pushed via WebSocket/Polling to Roku scene.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
