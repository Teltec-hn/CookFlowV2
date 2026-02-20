'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChefChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([
        { role: 'agent', text: "Yo! FlowChef here. What's cookin'?" }
    ]);
    const [input, setInput] = useState('');
    const [isGodMode, setIsGodMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            // Call Edge Function
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-agent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ message: userMsg, userId: 'mock-user-id' }) // TODO: Real Auth
            });

            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'agent', text: data.reply }]);
            }

            if (data.isGodMode) {
                setIsGodMode(true);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'agent', text: "Mic check... 1, 2... something went wrong." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all ${isGodMode ? 'animate-pulse-gold' : ''}`}>

            {/* Chat Window */}
            {isOpen && (
                <div className={`mb-4 w-80 h-96 bg-surface border border-surface rounded-xl shadow-2xl flex flex-col overflow-hidden ${isGodMode ? 'ring-2 ring-mustard' : ''}`}>
                    {/* Header */}
                    <div className="bg-charcoal-dark p-3 flex justify-between items-center border-b border-surface">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-chef-fire flex items-center justify-center text-sm">👨‍🍳</div>
                            <span className="font-bold text-cream">FlowChef {isGodMode && '👑'}</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-opacity-50 bg-black">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.role === 'user'
                                        ? 'bg-mustard text-charcoal-dark'
                                        : 'bg-surface text-gray-200 border border-gray-700'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-surface text-gray-400 p-2 rounded-lg text-xs italic animate-pulse">
                                    Dropping bars...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-charcoal-dark border-t border-surface flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Spit some rhymes..."
                            className="flex-1 bg-surface text-white text-sm rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-mustard"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading}
                            className="bg-chef-fire text-white px-3 py-2 rounded-r-md text-sm hover:bg-orange-600 disabled:opacity-50"
                        >
                            🎤
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${isGodMode
                        ? 'bg-gradient-to-r from-mustard to-chef-fire ring-4 ring-yellow-500/30'
                        : 'bg-chef-fire hover:bg-orange-600'
                    }`}
            >
                <span className="text-2xl">👨‍🍳</span>
            </button>

        </div>
    );
}
