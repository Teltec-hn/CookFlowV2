"use client";
import { motion } from "framer-motion";

interface ImpactDashboardProps {
    views: number;
    income: number;
    subscribers: number;
}

const MetricCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className={`p-4 bg-neutral-900 border border-${color}-900 rounded-lg flex flex-col items-center justify-center`}
    >
        <p className={`text-4xl font-bold text-${color}-500 tabular-nums`}>{value}</p>
        <p className="text-sm text-neutral-400 mt-2 uppercase">{title}</p>
    </motion.div>
);

export default function ImpactDashboard({ views, income, subscribers }: ImpactDashboardProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <MetricCard title="Vistas Totales" value={views.toLocaleString()} color="emerald" />
            <MetricCard title="Ingresos (USD)" value={`$${income.toFixed(2)}`} color="amber" />

            <div className="col-span-2 mt-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-lg border border-purple-800 flex justify-between items-center"
                >
                    <div>
                        <h3 className="text-xl font-bold text-purpule-300">Comunidad</h3>
                        <p className="text-sm text-purple-200">Personas cocinando contigo</p>
                    </div>
                    <div className="text-4xl font-bold text-white">
                        {subscribers.toLocaleString()}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
