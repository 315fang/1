import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageSquare, Sparkles, User, Loader2 } from 'lucide-react';
import { AppSettings } from '../hooks/useSettings';
import { cn } from '../utils/cn';
import { useAppControl } from '../contexts/AppControlContext';

interface AICompanionProps {
    settings: AppSettings;
    isNight: boolean;
    photos: import('../types').Photo[];
    profile: import('../types').Profile | null;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AICompanion: React.FC<AICompanionProps> = ({ settings, isNight, photos, profile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your AI companion. How can I help you today? ✨" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { music, meta, timeline, ui } = useAppControl();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !settings.aiConfig.enabled || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare System Prompt with Knowledge Base & Context Awareness
            const knowledgeBase = `
KNOWLEDGE BASE:
- Profile: ${profile ? JSON.stringify(profile) : 'Not loaded'}
- Days Together: ${meta.daysTogether} days.
- Recent Photos: ${photos.slice(0, 10).map(p => `[ID:${p.id}] ${p.title} (${p.date})`).join(', ')}... (Total ${photos.length} photos)
- Timeline Events: ${timeline.events.slice(0, 5).map(e => `${e.date}: ${e.title}`).join(', ')}...
`;

            const systemPrompt = `
${settings.aiConfig.systemPrompt}

${knowledgeBase}

CURRENT STATE:
- Music Playing: ${music.isPlaying}
- Current Song Index: ${music.currentIndex}

AVAILABLE TOOLS (Output JSON ONLY if using a tool):
1. MUSIC CONTROL: {"tool": "NEXT_SONG" | "PREV_SONG" | "TOGGLE_PLAY"}
2. UI CONTROL: 
   - {"tool": "OPEN_LIGHTBOX", "args": {"index": number}} (Use Photo ID as index if sequential, or find index by ID)
   - {"tool": "TOGGLE_THEME"}
   - {"tool": "SCROLL_TO", "args": {"section": "timeline" | "gallery" | "comments" | "footer"}}

INSTRUCTIONS:
- You are the intelligent soul of this space. You know everything about the couple based on the Knowledge Base.
- If user asks about a specific photo or memory, lookup the ID in Recent Photos and use OPEN_LIGHTBOX.
- If user wants to see the timeline/history, use SCROLL_TO section="timeline".
- If user says "it's too bright", use TOGGLE_THEME.
- Always be warm, empathetic, and romantic.
`;

            const response = await fetch(`${settings.aiConfig.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.aiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.aiConfig.model || 'deepseek-chat',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage }
                    ],
                    stream: false
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'API Error');
            }

            const aiContent = data.choices?.[0]?.message?.content || "I'm having trouble connecting to my brain right now. 🤯";

            // Check for Tool Call
            try {
                // Try to parse JSON from the response (it might be wrapped in text, but let's assume pure JSON for simple prompt instructions or extract the JSON block)
                // Basic extraction regex for JSON block if mixed with text
                const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const toolCall = JSON.parse(jsonMatch[0]);

                    if (toolCall.tool === 'NEXT_SONG') {
                        music.nextSong();
                        setMessages(prev => [...prev, { role: 'assistant', content: "Skipping to the next song... 🎵" }]);
                    } else if (toolCall.tool === 'PREV_SONG') {
                        music.prevSong();
                        setMessages(prev => [...prev, { role: 'assistant', content: "Replaying previous song... ⏮️" }]);
                    } else if (toolCall.tool === 'TOGGLE_PLAY') {
                        music.togglePlay();
                        setMessages(prev => [...prev, { role: 'assistant', content: music.isPlaying ? "Pausing music." : "Resuming music. ▶️" }]);
                    } else if (toolCall.tool === 'OPEN_LIGHTBOX') {
                        const idx = toolCall.args?.index || 0;
                        ui.openLightbox(idx);
                        setMessages(prev => [...prev, { role: 'assistant', content: "Opening that memory for you... 🖼️" }]);
                    } else if (toolCall.tool === 'TOGGLE_THEME') {
                        ui.toggleTheme();
                        setMessages(prev => [...prev, { role: 'assistant', content: "Switching theme... 🌗" }]);
                    } else if (toolCall.tool === 'SCROLL_TO') {
                        ui.scrollToSection(toolCall.args?.section || 'timeline');
                        setMessages(prev => [...prev, { role: 'assistant', content: `Navigating to ${toolCall.args?.section}... 🚀` }]);
                    } else {
                        // Unknown tool or mixed content
                        setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
                    }
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
                }
            } catch (e) {
                // Not JSON, just standard message
                setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
            }

        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API Key and Base URL settings.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!settings.aiConfig.enabled) return null;

    return (
        <>
            {/* Floating Trigger */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center backdrop-blur-md border border-white/20",
                    isNight ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-white/50 text-emerald-600 hover:bg-white/80"
                )}
            >
                <Bot size={28} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={cn(
                            "fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] rounded-2xl overflow-hidden shadow-2xl flex flex-col border backdrop-blur-xl",
                            isNight ? "bg-zinc-900/90 border-white/10" : "bg-white/90 border-white/40"
                        )}
                    >
                        {/* Header */}
                        <div className={cn(
                            "p-4 flex items-center justify-between border-b",
                            isNight ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50"
                        )}>
                            <div className="flex items-center gap-2">
                                <Sparkles size={18} className="text-yellow-500" />
                                <h3 className={cn("font-medium", isNight ? "text-white" : "text-slate-800")}>
                                    AI Companion
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={cn("p-1 rounded hover:bg-black/5", isNight ? "text-white/60" : "text-slate-400")}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex gap-2 max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                        msg.role === 'user'
                                            ? (isNight ? "bg-amber-500 text-black" : "bg-pink-500 text-white")
                                            : (isNight ? "bg-green-600 text-white" : "bg-emerald-100 text-emerald-600")
                                    )}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={18} />}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm leading-relaxed",
                                        msg.role === 'user'
                                            ? (isNight ? "bg-amber-500/10 text-amber-100 rounded-tr-none" : "bg-pink-500 text-white rounded-tr-none")
                                            : (isNight ? "bg-white/10 text-slate-200 rounded-tl-none" : "bg-slate-100 text-slate-700 rounded-tl-none")
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                        isNight ? "bg-green-600 text-white" : "bg-emerald-100 text-emerald-600"
                                    )}>
                                        <Bot size={18} />
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-2xl rounded-tl-none flex items-center gap-2",
                                        isNight ? "bg-white/10" : "bg-slate-100"
                                    )}>
                                        <Loader2 size={16} className="animate-spin text-slate-400" />
                                        <span className="text-xs opacity-50">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className={cn(
                                        "w-full pl-4 pr-12 py-3 rounded-xl outline-none text-sm transition-colors",
                                        isNight
                                            ? "bg-white/5 border border-white/10 text-white focus:border-green-500/50 placeholder-white/20"
                                            : "bg-slate-100 border border-slate-200 text-slate-800 focus:border-green-500/50"
                                    )}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "absolute right-2 top-2 p-1.5 rounded-lg transition-all",
                                        input.trim() && !isLoading
                                            ? (isNight ? "bg-green-500 text-black hover:bg-green-400" : "bg-emerald-500 text-white hover:bg-emerald-600")
                                            : "bg-transparent text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
