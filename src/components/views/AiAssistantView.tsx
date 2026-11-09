import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  Database,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { DatasetMetadata } from '../../types';
import { DashboardKpis } from '../../services/calculations';

interface AiAssistantViewProps {
  metadata: DatasetMetadata | null;
  kpis: DashboardKpis;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQueries?: string[];
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  metadata,
  kpis
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello, I am the **BritConnect Intelligence Assistant**. I analyze your verified active customer dataset (${metadata?.filename || 'Active Dataset'}) and trained machine learning pipelines.\n\nI can provide grounded answers regarding churn rates, revenue exposure, risk factors, customer segments, and retention strategies. How can I assist your team today?`,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      suggestedQueries: [
        'What is BritConnect\'s overall churn rate and revenue exposure?',
        'Which customer segment has the highest churn rate?',
        'What are the top 5 drivers influencing churn predictions?',
        'What is the projected financial return of targeting 200 critical-risk accounts?'
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          conversationHistory: messages.slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Analysis completed with verified dataset context.',
          timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          suggestedQueries: data.suggestedQueries
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'An error occurred while communicating with the analytics engine. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation context reset. Operating on active dataset: **${metadata?.filename || 'Active Dataset'}** (${kpis.totalCustomers.toLocaleString()} accounts). What would you like to investigate?`,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        suggestedQueries: [
          'What are the key churn factors for Enterprise accounts?',
          'How does customer satisfaction relate to churn?',
          'Recommend an action plan for accounts with network complaints'
        ]
      }
    ]);
  };

  const downloadConversation = () => {
    const transcript = messages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n\n`).join('');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BritConnect_AI_Transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col h-[750px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#091B33] text-[#D4AF37] border border-[#142B4C] flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">BritConnect Intelligence Assistant</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Grounded Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Active Context: {metadata?.filename} • MRR £{kpis.activeMrrGbp.toLocaleString()} • Churn {kpis.historicalChurnRatePct}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadConversation}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            title="Download Conversation Transcript"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetConversation}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-[#091B33] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#091B33] text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/90 rounded-tl-none space-y-2'
              }`}
            >
              <div className="whitespace-pre-line font-normal">
                {msg.text}
              </div>

              {msg.suggestedQueries && msg.suggestedQueries.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Suggested Analytical Follow-Ups:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedQueries.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-left text-[11px] text-[#142B4C] hover:text-[#091B33] bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-md transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-[10px] pt-1 text-right ${msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#142B4C] text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-200" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
            <div className="w-2 h-2 rounded-full bg-[#142B4C] animate-ping" />
            <span>Consulting dataset calculations & synthesizing response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            placeholder="Ask anything (e.g. 'What is our churn rate by service type?' or 'Recommend actions for high-risk accounts')..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#142B4C] focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 bg-[#091B33] hover:bg-[#142B4C] text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
