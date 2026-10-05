import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Plus,
  History,
  Trash2,
  X,
  MessageSquare,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { askGemini, askGeminiSummary } from '../lib/gemini.client';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const STORAGE_SESSIONS_KEY = 'recq360_ai_sessions';
const STORAGE_ACTIVE_ID_KEY = 'recq360_ai_active_session_id';

const createDefaultGreeting = (readiness: number): ChatMessage => ({
  id: `msg-${Date.now()}`,
  sender: 'ai',
  text: `Greetings Officer. I am RECQ360 AI, your tactical decision support engine.

City preparedness is currently **${readiness}%**. I have indexed all municipal zones, critical equipment registries, shelter power audits, and live telemetry feeds.

How can I assist your operational command today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export const AiAssistantView: React.FC = () => {
  const { zones, alerts, overallReadiness, activeCity } = useApp();

  const [summaryText, setSummaryText] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved AI sessions:', e);
      }
    }
    const defaultSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Initial Tactical Briefing',
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      messages: [createDefaultGreeting(overallReadiness || 78)],
    };
    return [defaultSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedActiveId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      if (savedActiveId) return savedActiveId;
    }
    return '';
  });

  // Ensure activeSessionId is valid
  const currentSession = useMemo(() => {
    const found = sessions.find((s) => s.id === activeSessionId);
    return found || sessions[0];
  }, [sessions, activeSessionId]);

  // Synchronize active session ID if missing
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [activeSessionId, sessions]);

  // Save sessions & active ID to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && sessions.length > 0) {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
      if (currentSession?.id) {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, currentSession.id);
      }
    }
  }, [sessions, currentSession]);

  const messages = currentSession?.messages || [];

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyPanelRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Close history panel on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showHistory &&
        historyPanelRef.current &&
        !historyPanelRef.current.contains(e.target as Node)
      ) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showHistory]);

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
        `City Readiness stands at ${overallReadiness}% across ${zones.length || 10} zones for ${activeCity?.name || 'Visakhapatnam'}. Priority response focuses on critical equipment readiness, shelter backup generator fuel supplies, and de-watering pumps along low-lying inundation zones.`
      );
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [activeCity]);

  // Handle New Chat Creation
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Tactical Briefing',
      createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      messages: [createDefaultGreeting(overallReadiness)],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowHistory(false);
  };

  // Switch to another session
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowHistory(false);
  };

  // Delete a session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'Initial Tactical Briefing',
          createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          messages: [createDefaultGreeting(overallReadiness)],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all AI tactical chat history?')) {
      const fresh: ChatSession = {
        id: `session-${Date.now()}`,
        title: 'Initial Tactical Briefing',
        createdAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        messages: [createDefaultGreeting(overallReadiness)],
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      setShowHistory(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const targetSessionId = currentSession?.id || `session-${Date.now()}`;

    // Update session title dynamically from the first user question if it's default
    const shouldUpdateTitle =
      currentSession?.title === 'New Tactical Briefing' ||
      currentSession?.title === 'Initial Tactical Briefing';

    const newTitle = shouldUpdateTitle
      ? query.slice(0, 36).trim() + (query.length > 36 ? '…' : '')
      : currentSession?.title || 'Tactical Briefing';

    // Optimistically append user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            title: newTitle,
            updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );

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
        [...messages, userMsg],
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answer || 'Understood. Operational dispatch logged.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
              messages: [...s.messages, aiMsg],
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `**Tactical AI Assistant (${activeCity?.name || 'Grid'}):** Overall city readiness is currently **${overallReadiness}%**. Active hazard: **${activeCity?.primaryHazard || 'Coastal Storm Surge'}**. Critical response teams, generators, and pump de-watering crews remain on standby.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: [...s.messages, fallbackMsg],
            };
          }
          return s;
        })
      );
    } finally {
      setIsSending(false);
    }
  };

  const SUGGESTED_QUERIES = [
    'Which zone has the most pending generators?',
    'Show shelters without backup power.',
    'List critical flood-prone areas in this city.',
    'Generate immediate 1-hour priority dispatch list.',
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto relative">
      {/* Top Banner with Integrated New Chat & History Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F1A2E] via-[#1A1238] to-[#0F1A2E] border border-[#7C5CFC]/40 rounded-lg p-5 shadow-2xl glow-violet relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7C5CFC]/20 border border-[#7C5CFC]/50 flex items-center justify-center text-[#7C5CFC]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                AI Tactical Assistant — Gemini 3.6
              </h1>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] font-mono text-[10px] border border-[#7C5CFC]/40">
                <Sparkles className="w-3 h-3 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Current Session: <span className="text-white font-semibold">{currentSession?.title}</span> • Data preserved across navigation
            </p>
          </div>
        </div>

        {/* Top-Right Action Controls: New Chat & History Drawer Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center relative">
          <button
            onClick={handleNewChat}
            className="px-3 py-1.5 rounded-lg bg-[#7C5CFC] hover:bg-[#6843f7] text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow transition-all glow-violet"
            title="Start a fresh AI tactical session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showHistory
                ? 'bg-[#2E9CCA] text-[#0B1220] border-[#2E9CCA]'
                : 'bg-[#152238] hover:bg-[#1f3152] text-slate-200 border-white/10'
            }`}
            title="View AI Chat History"
          >
            <History className="w-3.5 h-3.5 text-[#2E9CCA]" />
            <span>History ({sessions.length})</span>
          </button>

          {/* ChatGPT-style Floating History Panel */}
          {showHistory && (
            <div
              ref={historyPanelRef}
              className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0F1A2E] border border-[#7C5CFC]/40 rounded-xl shadow-2xl z-50 p-4 space-y-3 font-sans"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-[#7C5CFC]" />
                  <span>Tactical Chat History</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    {sessions.length} saved
                  </span>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Saved Sessions List */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {sessions.map((sess) => {
                  const isActive = sess.id === currentSession?.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess.id)}
                      className={`group p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-white shadow-sm'
                          : 'bg-[#0B1220] hover:bg-[#152238] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC] shrink-0" />}
                          <span className="truncate">{sess.title}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#2E9CCA]" />
                            {sess.updatedAt}
                          </span>
                          <span>•</span>
                          <span>{sess.messages.length} msgs</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all shrink-0"
                        title="Delete this conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* History Footer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  onClick={handleNewChat}
                  className="text-[#7C5CFC] hover:underline font-mono text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Start New Session</span>
                </button>
                <button
                  onClick={handleClearAllHistory}
                  className="text-red-400/80 hover:text-red-400 hover:underline font-mono text-[11px]"
                >
                  Clear All History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned AI Daily Summary Card */}
      <div className="bg-[#0F1A2E] border border-[#7C5CFC]/30 rounded-lg p-5 shadow-xl relative space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
            <h2 className="font-display font-semibold text-sm text-white uppercase tracking-wider">
              PINNED AI DAILY READINESS SUMMARY — {activeCity ? activeCity.name.toUpperCase() : 'VISAKHAPATNAM'}
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
            <span>Analyzing {zones.length} city zones & generating executive briefing...</span>
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
