"use client";
import { motion } from "framer-motion";

interface CalizProgressProps {
    targetAmount: number;
    currentAmount: number;
    percentage: number;
}

export default function CalizProgress({
    targetAmount,
    currentAmount,
    percentage,
}: CalizProgressProps) {
    // Clamp percentage between 0 and 100
    const fillHeight = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-64">
                {/* Fondo del Cáliz (SVG) */}
                <svg
                    viewBox="0 0 100 150"
                    className="absolute inset-0 w-full h-full text-neutral-800 drop-shadow-xl"
                >
                    <path
                        d="M10,10 Q50,150 90,10"
                        fill="currentColor"
                        stroke="#451a03"
                        strokeWidth="2"
                    />
                </svg>

                {/* Líquido (Animado) */}
                <div className="absolute inset-0 w-full h-full overflow-hidden flex items-end justify-center pb-2 [mask-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTUwIj48cGF0aCBkPSJNMTAsMTAgUTUwLDE1MCA5MCwxMCIgZmlsbD0iYmxhY2siLz48L3N2Zz4=')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]">
                    <motion.div
                        initial={{ height: "0%" }}
                        animate={{ height: `${fillHeight}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="w-full bg-gradient-to-t from-amber-600 via-yellow-500 to-yellow-300 opacity-90 relative"
                    >
                        {/* Burbujas */}
                        <motion.div
                            animate={{ y: [0, -100] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute bottom-0 left-1/4 w-2 h-2 bg-white/50 rounded-full"
                        />
                        <motion.div
                            animate={{ y: [0, -120] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 1 }}
                            className="absolute bottom-0 right-1/3 w-3 h-3 bg-white/30 rounded-full"
                        />
                    </motion.div>
                </div>

                {/* Overlay de Brillo */}
                <div className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-tr from-transparent to-white/10 rounded-full opacity-50" />
            </div>

            {/* Info */}
            <div className="mt-6 text-center">
                <p className="text-3xl font-bold text-amber-500 tabular-nums">
                    ${currentAmount.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">
                    Meta: ${targetAmount.toFixed(2)}
                </p>
                <div className="mt-2 text-xs font-mono text-yellow-600">
                    {percentage.toFixed(1)}% COMPLETADO
                </div>
            </div>
        </div>
    );
}
