"use client";
import { useEffect, useState } from 'react';
import AdminDashboard from "@/components/AdminDashboard";

export default function GodModePage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [password, setPassword] = useState("");

    // Simple (insecure) gate for prototype - replace with real auth later!
    const verify = () => {
        if (password === "rap-god-808") {
            setIsAdmin(true);
        } else {
            alert("Acceso denegado. Solo FlowChef Master puede entrar aquí.");
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 font-mono">
                <h1 className="text-4xl font-bold mb-8 animate-pulse">ACCESO RESTRINGIDO</h1>
                <div className="flex gap-4">
                    <input
                        type="password"
                        className="bg-neutral-900 border border-red-900 p-2 text-white"
                        placeholder="Clave Maestra"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        onClick={verify}
                        className="bg-red-900 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Ingresar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-emerald-400 font-mono p-8">
            <header className="mb-8 border-b border-emerald-900 pb-4 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-emerald-500">
                    GOD MODE: SYSTEM CONTROL
                </h1>
                <span className="text-xs text-neutral-500">v2.1.0-alpha</span>
            </header>

            <main>
                {/* Usamos el componente AdminDashboard existente */}
                <AdminDashboard />

                {/* Controles Adicionales de API */}
                <section className="mt-8 border border-emerald-900 p-4 rounded bg-black/50">
                    <h3 className="text-xl font-bold mb-4 text-emerald-300">Auditoría de Agente IA</h3>
                    <div className="bg-neutral-900 p-4 rounded text-xs text-neutral-400 overflow-x-auto">
                        <pre>
                            Log: Agent Chat [2026-02-20T00:45:00] - "Hola chef" -&gt; "¡Qué pasa cocinero!" [Mood: Enthusiastic]
                            Log: Agent Chat [2026-02-20T00:45:05] - "Receta tacos" -&gt; "Aquí tienes la magia..." [Mood: Helpful]
                        </pre>
                    </div>
                    <button className="mt-4 bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded text-sm">
                        Purgar Memoria del Agente
                    </button>
                </section>
            </main>
        </div>
    );
}
