// components/nerve-center/thought-stream.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
}

export function ThoughtStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/gateway/sessions');
        const data = await res.json();
        
        // Parse session data into messages
        // TODO: Implement actual parsing based on Gateway API response
        const parsed: Message[] = [];
        setMessages(parsed);
        
        // Check if thinking (last message is user with no assistant reply)
        const lastMsg = parsed[parsed.length - 1];
        setIsThinking(lastMsg?.role === 'user');
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-emerald-500/10 border-emerald-500/50';
      case 'assistant': return 'bg-purple-500/10 border-purple-500/50';
      case 'tool': return 'bg-amber-500/10 border-amber-500/50';
      default: return 'bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="h-[60vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-100">Live Thought Stream</h3>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 border rounded-lg ${getMessageColor(msg.role)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-400">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-xs font-medium text-zinc-300 uppercase">
                {msg.role}
              </span>
            </div>
            <p className="text-sm font-mono text-zinc-100">{msg.content}</p>
          </motion.div>
        ))}
        
        {isThinking && (
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="p-3 border border-purple-500/50 bg-purple-500/10 rounded-lg"
          >
            <p className="text-sm font-mono text-purple-300">Thinking...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
