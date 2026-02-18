'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminDashboard() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/login')
            } else {
                setUserEmail(session.user.email || 'Admin')
                setIsLoading(false)
            }
        }
        checkSession()
    }, [router, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
        router.refresh()
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                    <span>Loading Dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800 bg-slate-900 p-4">
                <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
                    <h1 className="text-xl font-bold tracking-tight">CookFlow</h1>
                </div>

                <nav className="space-y-1">
                    <a href="#" className="flex items-center rounded-md bg-indigo-600/10 px-3 py-2 text-sm font-medium text-indigo-400">
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
                        Users
                    </a>
                    <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
                        Global Recipes
                    </a>
                    <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
                        API Settings
                    </a>
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            Teltec Control Center
                        </h2>
                        <p className="mt-1 text-slate-400">
                            Welcome back, {userEmail}
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-800"></div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Stat Card 1 */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400">Active Users</h3>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                ↑
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-white">1,234</p>
                        <p className="mt-1 text-xs text-slate-500">+12% from last month</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400">Spoonacular Requests</h3>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                                ⚡
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-white">85.4k</p>
                        <p className="mt-1 text-xs text-slate-500">98.2% success rate</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400">Registered Chefs</h3>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                ★
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-white">42</p>
                        <p className="mt-1 text-xs text-slate-500">3 pending approval</p>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h3 className="text-lg font-medium text-white">System Status</h3>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-slate-950 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm text-slate-300">API Gateway</span>
                            </div>
                            <span className="text-xs font-medium text-emerald-500">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-950 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm text-slate-300">Database Replica</span>
                            </div>
                            <span className="text-xs font-medium text-emerald-500">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-950 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm text-slate-300">Auth Service</span>
                            </div>
                            <span className="text-xs font-medium text-emerald-500">OPERATIONAL</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
