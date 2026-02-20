"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic } from "lucide-react";

interface Message {
    id: string;
    sender: "user" | "agent";
    text: string;
    mood?: string;
    timestamp: string;
}

export default function ChefChat() {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", sender: "agent", text: "¡Hey! ¿Qué cocinamos hoy? Tu cocina, a tu ritmo.", timestamp: "12:00", mood: "enthusiastic" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/v1/agent/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: "viewer_123", // TODO: Replace with real user ID
                    chef_id: "flowchef_rapper",
                    message: userMsg.text
                })
            });

            if (!response.ok) throw new Error("Failed to chat with chef");

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: "agent",
                text: data.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                mood: data.mood
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: "agent",
                text: "Lo siento, me he quemado con el horno. Inténtalo de nuevo más tarde.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                mood: "error"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900 font-sans text-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-lg shadow-md ${msg.sender === "user"
                                    ? "bg-amber-600 text-white rounded-br-none"
                                    : "bg-neutral-800 text-amber-100 rounded-bl-none border border-neutral-700"
                                    }`}
                            >
                                <p>{msg.text}</p>
                                <span className="text-[10px] opacity-50 block text-right mt-1">{msg.timestamp}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-neutral-800 text-amber-100 rounded-lg rounded-bl-none border border-neutral-700 px-4 py-2 opacity-70">
                            <span className="animate-pulse">...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-neutral-200 focus:outline-none focus:border-amber-700 transition-colors"
                />
                <button className="p-2 text-neutral-400 hover:text-amber-500 transition-colors">
                    <Mic size={20} />
                </button>
                <button
                    onClick={handleSend}
                    className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg transition-transform active:scale-95"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
