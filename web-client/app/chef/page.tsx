'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function ChefDashboard() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [chefName, setChefName] = useState<string | null>(null)

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
                // In a real app, we might fetch the chef's display name from a profile table
                setChefName(session.user.user_metadata?.full_name || session.user.email || 'Chef')
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
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                    <span>Loading Studio...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800 bg-slate-900 p-4">
                <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-lg font-bold">
                        C
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">CookFlow Studio</h1>
                </div>

                <nav className="space-y-1">
                    <a href="#" className="flex items-center rounded-md bg-amber-600/10 px-3 py-2 text-sm font-medium text-amber-500">
                        My Studio
                    </a>
                    <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
                        My Recipes
                    </a>
                    <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
                        My Subscribers
                    </a>
                    <a href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
                        Analytics
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
                            CookFlow Creator Studio
                        </h2>
                        <p className="mt-1 text-slate-400">
                            Welcome back, {chefName}. Ready to cook something up?
                        </p>
                    </div>
                    <button className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors shadow-lg shadow-amber-900/20">
                        + Upload Chef DNA
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Stat Card 1 */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400">Active Subscribers</h3>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                                👥
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-white">8,420</p>
                        <p className="mt-1 text-xs text-slate-500">+125 this week</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400">Published Recipes</h3>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                📖
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-white">142</p>
                        <p className="mt-1 text-xs text-slate-500">3 drafts in progress</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400">Average Rating</h3>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                ⭐
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-white">4.9</p>
                        <p className="mt-1 text-xs text-slate-500">Based on 12k reviews</p>
                    </div>
                </div>

                {/* Big CTA Area */}
                <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-white">New Recipe</h3>
                    <p className="mt-2 text-sm text-slate-400">
                        Share your culinary masterpiece with the world. Upload your Chef DNA to get started.
                    </p>
                    <div className="mt-6">
                        <button className="inline-flex items-center rounded-md bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all">
                            + Upload Chef DNA (New Recipe)
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
