import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Button, Input, Avatar, AvatarImage, AvatarFallback, Card, CardContent } from '../ui/index';
import { cn } from '../../lib/utils';
import { Message, Coworker, AssessmentState } from '../../types/index';

interface ChatInterfaceProps {
  coworker: Coworker;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping?: boolean;
  assessmentState?: AssessmentState;
}

export function ChatInterface({ coworker, messages, onSendMessage, isTyping, assessmentState }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const renderText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3).replace(/^.*\n/, '');
        return (
          <pre key={i} className="bg-slate-800 text-slate-100 p-3 rounded-md my-2 overflow-x-auto text-xs font-mono border border-slate-700 shadow-sm">
            <code>{content}</code>
          </pre>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  const isManager = coworker.role.toLowerCase().includes('manager');
  const showPRHint = isManager && assessmentState?.status === 'WORKING' && !assessmentState.prUrl && messages.length > 2;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground animate-fade-in">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <MessageSquare size={32} className="text-slate-300"/>
             </div>
             <p className="font-medium text-slate-900">Start a conversation with {coworker.name}</p>
             <p className="text-sm text-slate-500 mt-1 max-w-xs">{coworker.personaStyle}</p>
          </div>
        )}
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-3 max-w-[90%] md:max-w-[80%] animate-slide-up",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <Avatar className={cn("h-8 w-8 mt-1 border", isUser ? "bg-primary border-primary" : "border-slate-200")}>
                {isUser ? (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">You</AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={coworker.avatarUrl} />
                    <AvatarFallback className="text-xs">{coworker.name[0]}</AvatarFallback>
                  </>
                )}
              </Avatar>
              
              <div className={cn(
                "p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm min-w-[60px]",
                isUser 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-white border border-slate-200/60 rounded-tl-sm text-slate-800"
              )}>
                <div className={cn("break-words", isUser ? "text-white" : "text-slate-800")}>
                  {renderText(msg.text)}
                </div>
                <div className={cn(
                  "text-[10px] mt-1.5 opacity-70 flex items-center justify-end gap-1", 
                  isUser ? "text-primary-foreground/90" : "text-slate-400"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 mr-auto animate-fade-in">
             <Avatar className="h-8 w-8 mt-1 border border-slate-200">
                <AvatarImage src={coworker.avatarUrl} />
                <AvatarFallback>{coworker.name[0]}</AvatarFallback>
             </Avatar>
             <div className="bg-white border border-slate-200/60 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-11">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
             </div>
          </div>
        )}

        {showPRHint && (
           <div className="mx-auto max-w-sm my-4 animate-fade-in">
             <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
               <LinkIcon className="w-5 h-5 text-blue-500 mt-0.5" />
               <div className="text-xs text-blue-800">
                 <p className="font-semibold">Ready to submit?</p>
                 <p className="mt-1">Paste your PR link here when you're done to unlock the code review call.</p>
               </div>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto relative">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${coworker.name}...`}
            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 pr-12 h-11"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim()}
            className={cn("absolute right-1 top-1 h-9 w-9 transition-all", inputValue.trim() ? "bg-primary" : "bg-slate-200 text-slate-400 hover:bg-slate-200")}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}