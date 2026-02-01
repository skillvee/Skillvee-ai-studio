import React from 'react';
import { PhoneOff, Mic, X } from 'lucide-react';
import { Button, Avatar, AvatarImage, AvatarFallback, Badge } from '../ui/index';
import { cn } from '../../lib/utils';
import { useVoiceConversation } from '../../hooks/use-voice-conversation';
import { buildCoworkerVoicePrompt, summarizeChatForVoice } from '../../prompts/coworker-voice';
import { Coworker, Scenario, Message } from '../../types/index';

interface VoiceCallOverlayProps {
  coworker: Coworker;
  scenario: Scenario;
  messages: Message[];
  onClose: () => void;
}

export function VoiceCallOverlay({ coworker, scenario, messages, onClose }: VoiceCallOverlayProps) {
  const chatHistory = summarizeChatForVoice(messages);

  const systemInstruction = buildCoworkerVoicePrompt({
    coworker,
    scenario,
    candidateName: 'Candidate',
    chatHistory: chatHistory || undefined,
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
  };

  // Auto-start call when overlay opens
  React.useEffect(() => {
    startCall();
    return () => {
      endCall();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-fade-in">
      {/* Close button */}
      <button
        onClick={handleEndCall}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>

      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-1000",
          isActive ? "bg-primary/30 opacity-100" : "bg-slate-700/20 opacity-50"
        )} />
      </div>

      <div className="z-10 flex flex-col items-center space-y-6 text-white">
        {/* Header */}
        <div className="text-center space-y-1">
          <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10">
            Voice Call
          </Badge>
          <h3 className="text-xl font-semibold mt-2">{coworker.name}</h3>
          <p className="text-slate-400 text-sm">{coworker.role}</p>
        </div>

        {/* Avatar with rings */}
        <div className="relative">
          {isActive && (
            <>
              <div className={cn(
                "absolute inset-0 rounded-full border-2 transition-all duration-300",
                isSpeaking
                  ? "border-primary scale-125 opacity-100"
                  : "border-slate-600 scale-100 opacity-30"
              )} />
              <div className={cn(
                "absolute inset-0 rounded-full border transition-all duration-500 delay-100",
                isSpeaking
                  ? "border-primary/50 scale-150 opacity-100"
                  : "border-slate-700 scale-100 opacity-20"
              )} />
            </>
          )}

          <Avatar className="h-28 w-28 border-4 border-slate-800 shadow-2xl relative z-10">
            <AvatarImage src={coworker.avatarUrl} />
            <AvatarFallback className="bg-slate-700 text-3xl">
              {coworker.name[0]}
            </AvatarFallback>
          </Avatar>

          {/* Mic indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-4 border-slate-900 flex items-center justify-center transition-colors",
            isActive ? "bg-green-500" : "bg-slate-600"
          )}>
            <Mic size={14} className={isActive ? "text-white animate-pulse" : "text-slate-400"} />
          </div>
        </div>

        {/* Status */}
        <div className="h-6 flex items-center justify-center">
          {isActive ? (
            isSpeaking ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3 bg-primary rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
                <span className="w-1 h-4 bg-primary rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.1s]" />
                <span className="w-1 h-3 bg-primary rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" />
                <span className="ml-2 text-primary text-xs uppercase tracking-wider">Speaking</span>
              </div>
            ) : (
              <span className="text-slate-400 text-xs uppercase tracking-wider">Listening...</span>
            )
          ) : (
            <span className="text-slate-500 text-xs">Connecting...</span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* End call button */}
        <Button
          size="lg"
          variant="destructive"
          className="rounded-full px-8 shadow-lg"
          onClick={handleEndCall}
        >
          <PhoneOff className="mr-2 h-5 w-5" />
          End Call
        </Button>
      </div>
    </div>
  );
}