'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatbotProps {
  dealId: string;
  brandId: string;
  creatorId: string;
  onComplete: () => void;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

const QUESTIONS = [
  "What is the best time for our team to connect with you?",
  "Do you have any strict deadlines for this campaign?",
  "Are there any specific deliverables you'd like to highlight?",
  "Any special requirements or notes before we connect you?"
];

export default function PostDealChatbot({ dealId, brandId, creatorId, onComplete, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', sender: 'bot', text: "Deal Accepted! 🎉 To help our team connect you faster, please answer 4 quick questions." },
    { id: 'q0', sender: 'bot', text: QUESTIONS[0] }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    const userMsg: Message = { id: `u${currentQuestionIndex}`, sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    const newAnswers = [...answers, inputValue];
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        const nextQMsg: Message = { id: `q${currentQuestionIndex + 1}`, sender: 'bot', text: QUESTIONS[currentQuestionIndex + 1] };
        setMessages(prev => [...prev, nextQMsg]);
        setCurrentQuestionIndex(prev => prev + 1);
      }, 600);
    } else {
      // Completed!
      setIsSubmitting(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: 'final', sender: 'bot', text: "Thanks! Saving your preferences..." }]);
      }, 500);

      try {
        const res = await fetch('/api/chats/bot-flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId,
            brandId,
            creatorId,
            answers: newAnswers
          })
        });

        if (res.ok) {
          setMessages(prev => [...prev, { id: 'done', sender: 'bot', text: "All done! Our team will connect with you both shortly. You can now close this chat." }]);
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          setMessages(prev => [...prev, { id: 'err', sender: 'bot', text: "Oops, something went wrong saving your answers." }]);
          setIsSubmitting(false);
        }
      } catch (e) {
        console.error(e);
        setMessages(prev => [...prev, { id: 'err', sender: 'bot', text: "Network error saving answers." }]);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1a1a2e]/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-md h-[80vh] max-h-[600px] rounded-[24px] shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-[#EF4823] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Kalinq Assistant</h3>
              <p className="text-white/80 text-xs font-medium">We usually reply instantly</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto ${msg.sender === 'user' ? 'bg-[#EF4823]' : 'bg-gray-200'}`}>
                  {msg.sender === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-600" />}
                </div>
                <div className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#EF4823] text-white rounded-br-sm' 
                    : 'bg-white text-gray-700 rounded-bl-sm border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your answer..."
              disabled={isSubmitting || currentQuestionIndex >= QUESTIONS.length}
              className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-[#EF4823]/20 rounded-full py-3.5 pl-5 pr-14 text-[14px] font-medium transition-all outline-none disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isSubmitting || currentQuestionIndex >= QUESTIONS.length}
              className="absolute right-1.5 w-10 h-10 bg-[#EF4823] hover:bg-[#d83e1c] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
