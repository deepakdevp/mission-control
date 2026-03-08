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
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setIsLoading(false);
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
      case 'user': return 'bg-[#D1FAE5] border-[#10B981]';
      case 'assistant': return 'bg-[#F0EFFE] border-[#5B4EE8]';
      case 'tool': return 'bg-[#FEF3C7] border-[#F59E0B]';
      default: return 'bg-[#F9FAFB] border-[#EEEEEE]';
    }
  };

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="h-[60vh] flex flex-col card overflow-hidden !p-0">
      <div className="px-6 py-4 border-b border-[#EEEEEE]">
        <h3 className="text-base font-semibold text-[#1A1A2E]">Live Thought Stream</h3>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 border rounded-lg ${getMessageColor(msg.role)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#6B7280]">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-xs font-medium text-[#1A1A2E] uppercase">
                {msg.role}
              </span>
            </div>
            <p className="text-sm font-mono text-[#374151]">{msg.content}</p>
          </motion.div>
        ))}
        
        {isThinking && (
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="p-3 border border-[#5B4EE8] bg-[#F0EFFE] rounded-lg"
          >
            <p className="text-sm font-mono text-[#5B4EE8]">Thinking...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
