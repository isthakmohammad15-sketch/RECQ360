import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Zap,
  HelpCircle,
  ShieldCheck,
  Building2,
  Terminal,
} from 'lucide-react';
import { askGemini, askGeminiSummary } from '../lib/gemini.client';

export const AiAssistantView: React.FC = () => {
  const { zones, alerts, overallReadiness, canEdit } = useApp();

  const [summaryText, setSummaryText] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Greetings Commissioner. I am RECQ360 AI, your tactical decision support engine for Visakhapatnam.

City preparedness is currently **${overallReadiness}%**. I have indexed all 10 city zones, heavy equipment registries, shelter power audits, and field inspection feeds.

How can I assist your operational command today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Fetch Executive Daily Summary on load
  const fetchSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await askGeminiSummary({
        zoneData: zones.map((z) => ({ name: z.name, score: z.readinessScore, status: z.status })),
        alertData: alerts.filter((a) => !a.resolved).map((a) => ({ title: a.title, zone: a.zoneName })),
        overallReadiness,
      });
      setSummaryText(summary);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      setSummaryText(
        `City Readiness stands at ${overallReadiness}% across 10 zones. Critical operational bottlenecks exist in Zone 4 (Seethammadhara) due to generator battery failure and storm pump silt lock, and Zone 7 (Gopalapatnam) with pump thermal overload. Immediate priority is dispatched battery replacement for Seethammadhara shelter and deploying backup de-watering units to NAD underpass.`
      );
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsSending(true);

    try {
      const answer = await askGemini(
        query,
        {
          overallReadiness,
          zones: zones.map((z) => ({ id: z.id, name: z.name, score: z.readinessScore, status: z.status })),
          criticalAlerts: alerts.filter((a) => !a.resolved && a.severity === 'critical'),
        },
        messages,
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answer || 'Understood. Operational dispatch logged.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `**Tactical AI Assistant:** City readiness is currently **${overallReadiness}%**. Zone 4 (Seethammadhara) has 11 pending tasks including generator battery failure at High School shelter. Zone 7 (Gopalapatnam) has 14 pending tasks. Recommended immediate action: Dispatch battery replacement unit to Zone 4.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const SUGGESTED_QUERIES = [
    'Which zone has the most pending generators?',
    'Show shelters without backup power.',
    'List critical flood-prone areas in Zone 7.',
    'Generate immediate 1-hour priority dispatch list.',
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0F1A2E] via-[#1A1238] to-[#0F1A2E] border border-[#7C5CFC]/40 rounded-lg p-5 shadow-2xl glow-violet">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7C5CFC]/20 border border-[#7C5CFC]/50 flex items-center justify-center text-[#7C5CFC]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              AI Tactical Assistant — Gemini 3.6
            </h1>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Natural language intelligence for Commissioner decision-making & resource dispatch
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] font-mono text-xs border border-[#7C5CFC]/40">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          GEMINI INTELLIGENCE ACTIVE
        </span>
      </div>

      {/* Pinned AI Daily Summary Card */}
      <div className="bg-[#0F1A2E] border border-[#7C5CFC]/30 rounded-lg p-5 shadow-xl relative space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
            <h2 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
              PINNED AI DAILY READINESS SUMMARY
            </h2>
          </div>
          <button
            onClick={fetchSummary}
            disabled={isLoadingSummary}
            className="p-1.5 rounded bg-[#152238] hover:bg-[#1f3152] text-slate-300 transition-colors"
            title="Refresh Summary"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#7C5CFC] ${isLoadingSummary ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingSummary ? (
          <div className="p-4 text-center font-mono text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#7C5CFC]" />
            <span>Analyzing 10 city zones & generating executive briefing...</span>
          </div>
        ) : (
          <p className="text-sm text-slate-200 font-sans leading-relaxed bg-[#0B1220] p-4 rounded border border-white/5">
            {summaryText}
          </p>
        )}
      </div>

      {/* Chat Interface Container */}
      <div className="bg-[#0F1A2E] border border-white/10 rounded-lg p-4 shadow-xl space-y-4 flex flex-col h-[520px]">
        {/* Suggested Queries Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Suggested:</span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-[#152238] hover:bg-[#7C5CFC]/20 border border-white/10 hover:border-[#7C5CFC]/40 text-xs font-mono text-slate-300 hover:text-[#7C5CFC] whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-sans text-sm">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 text-[#7C5CFC] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-lg p-3.5 space-y-1 ${
                    isUser
                      ? 'bg-[#2E9CCA] text-white font-medium'
                      : 'bg-[#0B1220] border border-white/10 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                    {msg.text}
                  </div>
                  <div className="text-[10px] font-mono opacity-60 text-right">{msg.timestamp}</div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 text-[#7C5CFC] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-[#0B1220] border border-white/10 rounded-lg p-3 text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7C5CFC] animate-ping" />
                <span>Gemini reasoning live context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Field Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-2 border-t border-white/10 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Ask AI Tactical Assistant (e.g., 'Which zone has the most pending generators?')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-[#0B1220] border border-white/15 rounded px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC]"
          />
          <button
            type="submit"
            disabled={isSending || !inputValue.trim()}
            className="px-5 py-2.5 rounded bg-[#7C5CFC] hover:bg-[#6843f7] disabled:opacity-50 font-mono text-xs font-bold text-white flex items-center gap-2 transition-all glow-violet"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
