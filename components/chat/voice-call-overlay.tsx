import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, X, Phone } from 'lucide-react';
import { Button, Avatar, AvatarImage, AvatarFallback } from '../ui/index';
import { cn } from '../../lib/utils';
import { useVoiceConversation } from '../../hooks/use-voice-conversation';
import { buildCoworkerVoicePrompt, summarizeChatForVoice } from '../../prompts/coworker-voice';
import { buildDefensePrompt } from '../../prompts/manager';
import { Coworker, Scenario, Message, AssessmentState } from '../../types/index';
import { useAssessment } from '../../hooks/use-assessment';

interface VoiceCallOverlayProps {
  coworker: Coworker;
  scenario: Scenario;
  messages: Message[];
  onClose: () => void;
  prUrl?: string | null;
  isIncoming?: boolean;
  onCallEnded?: () => void;
}

export function VoiceCallOverlay({ coworker, scenario, messages, onClose, prUrl, isIncoming = false, onCallEnded }: VoiceCallOverlayProps) {
  const [callStatus, setCallStatus] = useState<'incoming' | 'connected'>(isIncoming ? 'incoming' : 'connected');
  
  // Decide which prompt to use: Defense/Review or Standard Coworker Chat
  const systemInstruction = prUrl 
    ? buildDefensePrompt({
        managerName: coworker.name,
        managerRole: coworker.role,
        companyName: scenario.companyName,
        candidateName: 'Candidate',
        taskDescription: scenario.taskDescription,
        techStack: scenario.techStack,
        repoUrl: scenario.repoUrl,
        prUrl: prUrl,
      })
    : buildCoworkerVoicePrompt({
        coworker,
        scenario,
        candidateName: 'Candidate',
        chatHistory: summarizeChatForVoice(messages),
      });

  const {
    isActive,
    isSpeaking,
    error,
    startCall,
    endCall
  } = useVoiceConversation({
    systemInstruction,
    voiceName: coworker.voiceName
  });

  const handleEndCall = () => {
    endCall();
    onClose();
    if (onCallEnded) onCallEnded();
  };

  const handleAnswer = () => {
    setCallStatus('connected');
  };

  useEffect(() => {
    if (callStatus === 'connected') {
      startCall();
    }
    return () => {
      endCall();
    };
  }, [callStatus]);

  if (callStatus === 'incoming') {
    return (
      <div className="fixed bottom-6 left-6 z-[100] w-[280px] animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden relative p-6">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center relative z-10">
            {/* Pulsing Avatar */}
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-[#237CF1]/20 animate-[ping_1.5s_ease-in-out_infinite]" />
              <div className="absolute inset-0 rounded-full border border-[#237CF1] animate-[pulse_2s_ease-in-out_infinite]" />
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg relative z-10">
                <AvatarImage src={coworker.avatarUrl} />
                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xl">{coworker.name[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center mb-8">
              <h3 className="font-bold text-xl text-slate-900 leading-tight mb-1">{coworker.name}</h3>
              <p className="text-sm text-[#237CF1] font-semibold animate-pulse">Incoming Call...</p>
            </div>

            <div className="flex items-center gap-4 w-full justify-center">
              <button 
                onClick={handleEndCall}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center transition-all group-hover:bg-red-200 group-hover:scale-110">
                  <PhoneOff size={20} />
                </div>
                <span className="text-xs font-medium text-slate-500">Decline</span>
              </button>

              <button 
                onClick={handleAnswer}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="h-14 w-14 rounded-full bg-[#22C55E] text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition-all group-hover:bg-green-500 group-hover:scale-110 animate-bounce">
                  <Phone size={24} />
                </div>
                <span className="text-xs font-medium text-slate-900 font-bold">Answer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-[100] w-[260px] animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden relative">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#237CF1]/5 to-transparent pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={handleEndCall}
          className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors z-20"
        >
          <X size={14} />
        </button>

        <div className="p-5 flex flex-col items-center relative z-10">
          
          {/* Top Section: Avatar & Status */}
          <div className="relative mb-4">
             {/* Ring Animations */}
             {isActive && (
                <>
                  <div className={cn(
                    "absolute inset-0 rounded-full border-2 border-[#22C55E] transition-all duration-300",
                    isSpeaking ? "scale-125 opacity-100" : "scale-100 opacity-0"
                  )} />
                  <div className={cn(
                    "absolute inset-0 rounded-full bg-[#22C55E]/10 transition-all duration-1000",
                    isActive ? "scale-150 animate-pulse" : "scale-100 opacity-0"
                  )} />
                </>
             )}

             <Avatar className="h-14 w-14 border-2 border-white shadow-md relative z-10">
               <AvatarImage src={coworker.avatarUrl} />
               <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{coworker.name[0]}</AvatarFallback>
             </Avatar>
             
             {/* Connection Status Badge */}
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
               {error ? (
                 <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                   ERROR
                 </span>
               ) : (
                 <div className="bg-white text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-1">
                   <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#22C55E]" : "bg-slate-300")} />
                   {isActive ? (prUrl ? "Reviewing PR..." : "Connected") : "Connecting..."}
                 </div>
               )}
             </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="font-bold text-slate-900 leading-tight">{coworker.name}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{prUrl ? 'PR Review Call' : 'Voice Call'}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between w-full gap-2">
            
            {/* Mute (Visual only) */}
            <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <Mic size={16} />
            </button>

            {/* Waveform */}
            <div className="h-8 flex items-center justify-center gap-0.5 flex-1">
               {isActive ? (
                 Array.from({ length: 8 }).map((_, i) => (
                   <div 
                     key={i}
                     className={cn(
                       "w-1 bg-[#237CF1] rounded-full transition-all duration-100",
                       isSpeaking 
                         ? "animate-[music-bar_0.4s_ease-in-out_infinite]" 
                         : "h-1 opacity-20"
                     )}
                     style={{ 
                       animationDelay: `${i * 0.05}s`,
                       height: isSpeaking ? undefined : '4px'
                     }}
                   />
                 ))
               ) : (
                 <span className="text-[10px] text-slate-300">...</span>
               )}
            </div>

            {/* End Call */}
            <button 
              onClick={handleEndCall}
              className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all"
            >
              <PhoneOff size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; opacity: 0.5; }
          50% { height: 16px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}