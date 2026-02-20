import React from 'react';

/**
 * SkeletonDashboard ("Esqueleto de Carga")
 * 
 * Philosophy: "No es una 'espera', es el sistema preparando el escenario para el talento del Chef."
 * Design: Rounded blocks with pulsing amber/charcoal tones.
 */
export default function SkeletonDashboard() {
    return (
        <div className="w-full h-screen bg-charcoal-dark p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">

            {/* A. Zona de Identidad (Left Column) */}
            <div className="col-span-1 flex flex-col items-center justify-center space-y-6 animate-pulse">
                {/* Avatar Circle with Aura */}
                <div className="w-48 h-48 rounded-full bg-charcoal-base border-4 border-amber-glow/30 shadow-[0_0_20px_rgba(251,191,36,0.2)] animate-shimmer relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-charcoal-dark to-transparent opacity-50" />
                </div>

                {/* Name Placeholder */}
                <div className="h-8 w-48 bg-charcoal-base rounded-full animate-shimmer" />

                {/* Rank Badge Placeholder */}
                <div className="h-6 w-24 bg-charcoal-base rounded-full animate-shimmer" />

                {/* Metric: Resonance Label */}
                <div className="flex flex-col items-center gap-2 mt-8">
                    <div className="h-4 w-32 bg-charcoal-base rounded opacity-50" />
                    <div className="h-12 w-20 bg-amber-glow/20 rounded animate-shimmer" />
                </div>
            </div>

            {/* B. El Cáliz de Realización (Center Column - Main Focus) */}
            <div className="col-span-1 flex flex-col items-center justify-end pb-12 relative">
                {/* The Chalice Outline (CSS Shape) */}
                <div className="relative w-full max-w-sm aspect-[3/4] flex items-end justify-center">
                    {/* Liquid Fill Placeholder */}
                    <div className="w-full h-1/3 bg-gradient-to-t from-amber-glow/20 to-transparent rounded-b-3xl animate-pulse" />

                    {/* Glass Container Reflection */}
                    <div className="absolute inset-0 border-b-8 border-x-4 border-charcoal-base rounded-b-full opacity-30" />
                </div>

                {/* Goal Metadata */}
                <div className="mt-6 w-full max-w-xs space-y-3">
                    <div className="h-6 w-3/4 mx-auto bg-charcoal-base rounded animate-shimmer" />
                    <div className="h-4 w-1/2 mx-auto bg-charcoal-base/50 rounded animate-shimmer" />
                </div>
            </div>

            {/* C. El Radar de Impacto Social (Right Column) */}
            <div className="col-span-1 flex flex-col justify-center space-y-8 p-4">
                {/* Metric 1 */}
                <div className="flex items-center gap-4 animate-shimmer">
                    <div className="w-16 h-16 rounded-lg bg-charcoal-base" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-charcoal-base rounded" />
                        <div className="h-3 w-2/3 bg-charcoal-base/50 rounded" />
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="flex items-center gap-4 animate-shimmer delay-150">
                    <div className="w-16 h-16 rounded-lg bg-charcoal-base" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-charcoal-base rounded" />
                        <div className="h-3 w-2/3 bg-charcoal-base/50 rounded" />
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="flex items-center gap-4 animate-shimmer delay-300">
                    <div className="w-16 h-16 rounded-lg bg-charcoal-base" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-charcoal-base rounded" />
                        <div className="h-3 w-2/3 bg-charcoal-base/50 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
