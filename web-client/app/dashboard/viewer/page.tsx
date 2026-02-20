"use client";
import { useEffect, useState } from 'react';
import ChefChat from "@/components/ChefChat";

export default function ViewerDashboard() {
    const [recipes, setRecipes] = useState<any[]>([]);

    useEffect(() => {
        // TODO: Fetch from /api/v1/recipes
        setRecipes([
            { id: "1", title: "Tacos al Pastor Cuánticos", isPremium: true, image: "/images/tacos.jpg" },
            { id: "2", title: "Sopa de Letras Binaria", isPremium: false, image: "/images/soup.jpg" },
        ]);
    }, []);

    return (
        <div className="p-8 bg-neutral-950 min-h-screen text-neutral-200 font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-neutral-800 pb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    CookFlow: Explorador
                </h1>
                <div className="flex gap-4">
                    <span className="text-sm text-neutral-400">Tus Favoritos</span>
                    <span className="text-sm text-neutral-400">Suscripciones</span>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Feed de Recetas */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-6 text-amber-500">Recetas Destacadas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="bg-neutral-900 rounded-lg overflow-hidden shadow-lg border border-neutral-800 hover:border-amber-600 transition-all cursor-pointer">
                                <div className="h-48 bg-neutral-800 relative">
                                    {/* Placeholder Image */}
                                    <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs">
                                        Image: {recipe.title}
                                    </div>
                                    {recipe.isPremium && (
                                        <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                                            PREMIUM
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-neutral-100 mb-2">{recipe.title}</h3>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-xs text-neutral-400">FlowChef Master</span>
                                        <button className="text-amber-500 text-sm hover:underline">Ver Receta →</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat con IA */}
                <div className="lg:col-span-1 h-[600px] border border-neutral-800 rounded-lg bg-neutral-900 flex flex-col">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-950 rounded-t-lg">
                        <h3 className="text-amber-500 font-semibold">Chat con el Chef</h3>
                        <p className="text-xs text-neutral-500">Impulsado por IA</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ChefChat /> {/* Componente de chat existente */}
                    </div>
                </div>

            </main>
        </div>
    );
}
