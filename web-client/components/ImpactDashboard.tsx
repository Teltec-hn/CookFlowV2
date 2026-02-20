'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '../utils/supabase/client';
import { useLocale } from './LocaleContext';
import SkeletonDashboard from './SkeletonDashboard';
import AudioCapture from './AudioCapture';

// Types reflecting our DB schema
type Goal = {
    id: string;
    title: string;
    target_amount: number;
    current_amount: number;
};

type Impulse = {
    id: string;
    goal_id: string; // Foreign Key to Goal
    donor_name: string;
    amount: number;
    message: string;
};

type ChefProfile = {
    name: string;
    rank: 'plomo' | 'cobre' | 'oro';
    resonance_score: number;
    families_nourished: number;
    traditions_preserved: number;
    pro_potential_score: number;
    avatar_url?: string;
};

export default function ImpactDashboard() {
    const supabase = createClient();
    const { t, formatCurrency } = useLocale();

    const [loading, setLoading] = useState(true);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [impulses, setImpulses] = useState<Impulse[]>([]);
    const [chef, setChef] = useState<ChefProfile | null>(null);

    // Simulated Chef ID for demo/MVP (In real app, getting from auth or route param)
    // For now, let's assume we are viewing the first chef or a specific one.
    // const CHEF_ID = 'rapper_001'; 

    useEffect(() => {
        async function fetchData() {
            // 1. Fetch Chef Profile
            const { data: chefData } = await supabase
                .from('chef_profiles')
                .select('*')
                .limit(1)
                .single();

            if (chefData) setChef(chefData);

            // 2. Fetch Active Goal
            const { data: goalData } = await supabase
                .from('goals')
                .select('*')
                .eq('is_active', true)
                .limit(1)
                .maybeSingle(); // Use maybeSingle to avoid 406 error if no rows

            if (goalData) {
                setGoal(goalData);

                // 3. Fetch Recent Impulses for this goal
                const { data: impulseData } = await supabase
                    .from('gratitude_impulses')
                    .select('*')
                    .eq('goal_id', goalData.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (impulseData) setImpulses(impulseData);
            }

            // Artificial delay to show off the Skeleton UI (Essential for user experience per prompt)
            setTimeout(() => setLoading(false), 2500);
        }

        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('impact_dashboard')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'gratitude_impulses' },
                (payload) => {
                    const newImpulse = payload.new as Impulse;
                    // Add new impulse to list
                    setImpulses(prev => [newImpulse, ...prev].slice(0, 5));

                    // Update Goal Progress locally for instant feedback
                    if (goal && goal.id === newImpulse.goal_id) { // Check assuming goal_id is present
                        setGoal(prev => prev ? ({
                            ...prev,
                            current_amount: prev.current_amount + newImpulse.amount
                        }) : null);
                    } else if (!goal) {
                        // Determine if we need to re-fetch if no goal was present (edge case)
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, goal?.id]); // Re-subscribe if goal changes (not common in session)

    // Calculating Liquid Height for the Chalice
    const fillPercentage = useMemo(() => {
        if (!goal || goal.target_amount === 0) return 0;
        const pct = (goal.current_amount / goal.target_amount) * 100;
        return Math.min(pct, 100);
    }, [goal]);

    if (loading) {
        return <SkeletonDashboard />;
    }

    return (
        <div className="w-full min-h-screen bg-charcoal-dark p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-foreground overflow-hidden">

            {/* A. Zona de Identidad */}
            <div className="col-span-1 flex flex-col items-center justify-center space-y-6">
                {/* Avatar with Aura */}
                <div className={`w-48 h-48 rounded-full border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden flex items-center justify-center bg-charcoal-base
            ${chef?.rank === 'oro' ? 'border-amber-glow shadow-amber-glow/40' :
                        chef?.rank === 'cobre' ? 'border-orange-700 shadow-orange-700/40' :
                            'border-gray-500 shadow-gray-500/40'
                    }`}>
                    {chef?.avatar_url ? (
                        <img src={chef.avatar_url} alt={chef.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl text-gray-500 font-bold">{chef?.name?.charAt(0) || '?'}</span>
                    )}
                </div>

                <h2 className="text-2xl font-bold tracking-widest text-white">{chef?.name || 'Unknown Alchemist'}</h2>

                <div className="px-4 py-1 rounded-full bg-charcoal-base border border-white/10 text-sm uppercase tracking-widest text-amber-glow">
                    {chef?.rank || 'Iniciado'}
                </div>

                {/* Resonance */}
                <div className="flex flex-col items-center gap-2 mt-8 w-full max-w-xs">
                    <span className="text-xs uppercase tracking-widest text-gray-400">{t('resonance')}</span>
                    <div className="w-full bg-charcoal-base rounded-full h-4 overflow-hidden mb-2">
                        <div
                            className="bg-amber-glow h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${chef?.resonance_score || 0}%` }}
                        />
                    </div>
                    <span className="text-2xl font-mono text-amber-glow">{chef?.resonance_score || 0}%</span>
                </div>

                {/* Modo Cocina - Audio Capture */}
                <div className="w-full max-w-xs mt-6">
                    <AudioCapture
                        chefId={chef?.name || 'unknown'}
                        onAnalysisComplete={(data) => {
                            console.log("Analysis complete:", data);
                            // Optionally trigger a refresh or show a toast
                            alert(`Transcribed: ${data.transcript}`);
                        }}
                    />
                </div>
            </div>

            {/* B. El Cáliz de Realización */}
            <div className="col-span-1 flex flex-col items-center justify-end pb-12 relative z-10">

                {/* Chalice Container */}
                <div className="relative w-full max-w-sm aspect-[3/4] flex items-end justify-center rounded-b-[40%] border-x-4 border-b-8 border-gray-700/50 bg-gray-800/20 backdrop-blur-sm overflow-hidden">

                    {/* Liquid Fill */}
                    <div
                        className="w-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 transition-all duration-[2000ms] ease-in-out relative"
                        style={{ height: `${fillPercentage}%` }}
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-white/30 animate-pulse" /> {/* Surface shimmer */}
                    </div>

                    {/* Glass Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                </div>

                {/* Goal Metadata Overlay */}
                <div className="mt-8 text-center space-y-2">
                    <h3 className="text-xl font-light text-gray-300">{goal?.title || 'No active goal'}</h3>
                    <div className="text-4xl font-mono text-amber-glow font-bold">
                        {formatCurrency(goal ? (goal.target_amount - goal.current_amount) : 0)}
                    </div>
                    <p className="text-xs uppercase tracking-widest text-gray-500">{t('goal_remaining')}</p>
                </div>

                {/* Impulse List Pop-up (simplified for MVP as inline list) */}
                {impulses.length > 0 && (
                    <div className="absolute bottom-32 -right-4 w-48 bg-charcoal-base/90 p-3 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-4 fade-in">
                        <span className="text-xs text-gray-400 mb-2 block">Latest Gratitude</span>
                        {impulses.map(imp => (
                            <div key={imp.id} className="text-xs mb-1 text-white border-b border-white/5 pb-1 last:border-0">
                                <span className="text-amber-glow font-bold">{formatCurrency(imp.amount)}</span> from {imp.donor_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* C. El Radar de Impacto Social */}
            <div className="col-span-1 flex flex-col justify-center space-y-8 p-4">

                <MetricCard
                    label={t('families_nourished')}
                    value={chef?.families_nourished || 0}
                    color="bg-green-500"
                />

                <MetricCard
                    label={t('traditions_preserved')}
                    value={chef?.traditions_preserved || 0}
                    color="bg-purple-500"
                />

                <MetricCard
                    label={t('pro_potential')}
                    value={`${chef?.pro_potential_score || 0}/100`}
                    color="bg-blue-500"
                />

            </div>
        </div>
    );
}

function MetricCard({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className={`w-16 h-16 rounded-xl ${color} bg-opacity-20 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`w-2 h-2 rounded-full ${color}`} />
            </div>
            <div className="flex-1">
                <div className="text-3xl font-light text-white">{value}</div>
                <div className="text-xs uppercase tracking-widest text-gray-500">{label}</div>
            </div>
        </div>
    );
}
