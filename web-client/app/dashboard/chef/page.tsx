"use client";
import { useEffect, useState } from 'react';
import CalizProgress from '@/components/CalizProgress';
import ImpactDashboard from "@/components/ImpactDashboard";

export default function ChefDashboard() {
    const [chefData, setChefData] = useState<any>(null);

    useEffect(() => {
        // TODO: Fetch real data from /api/v1/chefs/flowchef_rapper
        // For now, use mock data matching the API structure
        setChefData({
            id: "flowchef_rapper",
            name: "FlowChef Master",
            rank: "Oro",
            caliz: {
                target: 1000,
                current: 425.50,
                percentage: 42.55
            },
            stats: {
                views: 15234,
                income: 350.50,
                subscribers: 1205
            }
        });
    }, []);

    if (!chefData) return <div className="text-amber-500">Cargando la cocina...</div>;

    return (
        <div className="p-8 bg-black min-h-screen text-amber-50">
            <h1 className="text-4xl font-bold mb-8 text-amber-500 border-b border-amber-900 pb-4">
                Panel de Control: {chefData.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sección del Cáliz (Soberanía Económica) */}
                <section className="bg-neutral-900 p-6 rounded-lg border border-amber-900/50 hover:border-amber-700 transition-colors">
                    <h2 className="text-2xl font-semibold mb-4 text-amber-400">El Cáliz</h2>
                    <CalizProgress
                        targetAmount={chefData.caliz.target}
                        currentAmount={chefData.caliz.current}
                        percentage={chefData.caliz.percentage}
                    />
                    <p className="mt-4 text-sm text-neutral-400">
                        Rango actual: <span className="text-yellow-400 font-bold">{chefData.rank}</span>
                    </p>
                </section>

                {/* Sección de Impacto (Métricas) */}
                <section className="bg-neutral-900 p-6 rounded-lg border border-neutral-800">
                    <h2 className="text-2xl font-semibold mb-4 text-neutral-300">Impacto</h2>
                    <ImpactDashboard
                        views={chefData.stats.views}
                        income={chefData.stats.income}
                        subscribers={chefData.stats.subscribers}
                    />
                </section>
            </div>

            {/* Acciones Rápidas */}
            <div className="mt-8 flex gap-4">
                <button className="bg-amber-600 hover:bg-amber-700 text-black font-bold py-2 px-4 rounded transition-transform transform hover:scale-105">
                    Crear Nueva Receta
                </button>
                <button className="bg-neutral-800 hover:bg-neutral-700 text-amber-500 py-2 px-4 rounded border border-amber-900">
                    Editar Perfil (ADN)
                </button>
            </div>
        </div>
    );
}
