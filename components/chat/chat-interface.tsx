import React, { useState, useRef, useEffect } from 'react';
import { Send, Headphones, ArrowUp } from 'lucide-react';
import { Button, Input, Avatar, AvatarImage, AvatarFallback } from '../ui/index';
import { cn } from '../../lib/utils';
import { Message, Coworker, AssessmentState, Scenario } from '../../types/index';
import { VoiceCallOverlay } from './voice-call-overlay';

interface ChatInterfaceProps {
  coworker: Coworker;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
  assessmentState?: AssessmentState;
  scenario: Scenario;
  onDefenseCallStarted?: () => void;
  shouldStartCall?: boolean;
  onCallStartHandled?: () => void;
}

export function ChatInterface({ 
  coworker, 
  messages, 
  onSendMessage, 
  isTyping, 
  assessmentState,
  scenario,
  onDefenseCallStarted,
  shouldStartCall,
  onCallStartHandled
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Check for auto-start defense call condition (incoming from manager)
  useEffect(() => {
    if (
      assessmentState?.prUrl && // PR submitted
      !assessmentState.defenseCallStarted && // Call hasn't happened yet
      !isInCall && // Not already in call
      coworker.role.toLowerCase().includes('manager') // Talking to manager
    ) {
      // Small delay to allow the text message ("Calling you now...") to be read
      const timer = setTimeout(() => {
        setIsIncomingCall(true);
        setIsInCall(true);
        if (onDefenseCallStarted) onDefenseCallStarted();
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, [assessmentState?.prUrl, assessmentState?.defenseCallStarted, coworker, isInCall, onDefenseCallStarted]);

  // Check for manual auto-start (from sidebar headphone click)
  useEffect(() => {
    if (shouldStartCall) {
      setIsIncomingCall(false);
      setIsInCall(true);
      if (onCallStartHandled) onCallStartHandled();
    }
  }, [shouldStartCall, onCallStartHandled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleStartManualCall = () => {
    setIsIncomingCall(false);
    setIsInCall(true);
  };

  const renderText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3).replace(/^.*\n/, '');
        return (
          <pre key={i} className="bg-slate-900 text-slate-50 p-3 rounded-md my-2 overflow-x-auto text-xs font-mono border border-slate-800">
            <code>{content}</code>
          </pre>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      {/* Voice Call Overlay (Floating Bar) */}
      {isInCall && scenario && (
        <VoiceCallOverlay
          coworker={coworker}
          scenario={scenario}
          messages={messages}
          onClose={() => setIsInCall(false)}
          prUrl={assessmentState?.prUrl} // Pass PR URL if available to trigger defense mode
          isIncoming={isIncomingCall}
        />
      )}

      {/* HEADER: Fixed height 64px */}
      <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
        <div>
          <h3 className="font-bold text-slate-900 text-[15px] leading-tight">{coworker.name}</h3>
          <p className="text-xs text-slate-500 font-medium">{coworker.role}</p>
        </div>

        <Button
          variant="outline"
          onClick={handleStartManualCall}
          className="rounded-full h-9 px-4 shadow-sm border-slate-200 hover:bg-slate-50 hover:text-primary transition-colors gap-2 group"
        >
          <Headphones size={14} className="text-slate-500 group-hover:text-primary transition-colors" />
          <span className="text-xs font-semibold">Start Call</span>
        </Button>
      </div>

      {/* MESSAGES AREA */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
             <Avatar className="h-16 w-16 mb-4 border-2 border-slate-100 shadow-sm">
                <AvatarImage src={coworker.avatarUrl} />
                <AvatarFallback className="bg-slate-100 text-slate-400 text-xl">{coworker.name[0]}</AvatarFallback>
             </Avatar>
             <h2 className="text-lg font-bold text-slate-900 mb-2">Start a conversation with {coworker.name}</h2>
             <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
               {coworker.name} is a {coworker.role}. Ask questions about the project, codebase, or anything else you need help with.
             </p>
          </div>
        )}
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-3 max-w-[85%] group animate-slide-up",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className={cn("h-10 w-10 shrink-0 border border-black/5 shadow-sm mt-0")}>
                {isUser ? (
                  <AvatarFallback className="bg-primary text-white text-[10px] font-bold">You</AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={coworker.avatarUrl} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-sm">{coworker.name[0]}</AvatarFallback>
                  </>
                )}
              </Avatar>
              
              <div className="flex flex-col gap-1 min-w-0">
                <div className={cn(
                  "px-5 py-3 text-[15px] leading-relaxed shadow-sm break-words relative",
                  isUser 
                    ? "bg-[#237CF1] text-white rounded-2xl rounded-br-[4px]" 
                    : "bg-[#F4F4F5] text-slate-900 rounded-2xl rounded-bl-[4px]"
                )}>
                  {renderText(msg.text)}
                </div>
                <span className={cn(
                  "text-[12px] text-slate-400 font-medium px-1",
                  isUser ? "text-right" : "text-left"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto animate-fade-in">
             <Avatar className="h-10 w-10 shrink-0 border border-black/5 shadow-sm mt-0">
                <AvatarImage src={coworker.avatarUrl} />
                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-sm">{coworker.name[0]}</AvatarFallback>
             </Avatar>
             <div className="bg-[#F4F4F5] px-5 py-4 rounded-2xl rounded-bl-[4px] shadow-sm flex items-center gap-1.5 min-w-[60px]">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
             </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <div 
            className={cn(
              "flex items-center gap-2 rounded-full border transition-all duration-200 p-2 pl-4",
              isInputFocused 
                ? "bg-white border-[#237CF1] ring-2 ring-[#237CF1]/20 shadow-sm" 
                : "bg-[#F4F4F5] border-slate-200"
            )}
          >
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-slate-400 text-slate-900 min-w-0"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0",
                inputValue.trim() 
                  ? "bg-[#237CF1] text-white shadow-md hover:bg-blue-600 hover:scale-105 active:scale-95" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              <ArrowUp size={18} strokeWidth={3} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}