import React from 'react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { Button, Badge, Avatar, AvatarImage, AvatarFallback } from '../ui/index';
import { cn } from '../../lib/utils';
import { useVoiceConversation } from '../../hooks/use-voice-conversation';
import { buildDefensePrompt } from '../../prompts/manager';
import { Coworker, Scenario } from '../../types/index';

interface DefenseViewProps {
  manager: Coworker;
  scenario: Scenario;
  prUrl?: string | null;
}

export function DefenseView({ manager, scenario, prUrl }: DefenseViewProps) {
  const systemInstruction = buildDefensePrompt({
    managerName: manager.name,
    managerRole: manager.role,
    companyName: scenario.companyName,
    candidateName: "Candidate",
    taskDescription: scenario.taskDescription,
    techStack: scenario.techStack,
    repoUrl: scenario.repoUrl,
    prUrl: prUrl || `${scenario.repoUrl}/pull/1`
  });

  const { 
    isActive, 
    isSpeaking, 
    error, 
    startCall, 
    endCall 
  } = useVoiceConversation({
    systemInstruction,
    voiceName: manager.voiceName
  });

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] transition-opacity duration-1000",
          isActive ? "opacity-100" : "opacity-0"
        )} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="z-10 flex flex-col items-center space-y-8 max-w-md w-full animate-slide-up">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 mb-2">Live Interview</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Code Review</h2>
          <p className="text-slate-400 text-sm">Reviewing {prUrl ? 'your PR' : 'PR'} with {manager.name}</p>
        </div>

        <div className="relative">
          {isActive && (
            <>
              <div className={cn(
                "absolute inset-0 rounded-full border border-primary/50 transition-all duration-300",
                isSpeaking ? "scale-125 opacity-100 border-primary" : "scale-100 opacity-20"
              )} />
              <div className={cn(
                "absolute inset-0 rounded-full border border-primary/30 transition-all duration-700 delay-75",
                isSpeaking ? "scale-150 opacity-100" : "scale-100 opacity-10"
              )} />
            </>
          )}
          
          <div className="relative z-10">
            <Avatar className="h-32 w-32 border-4 border-slate-800 shadow-2xl">
              <AvatarImage src={manager.avatarUrl} />
              <AvatarFallback className="bg-slate-700 text-4xl">{manager.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className={cn(
              "absolute bottom-1 right-1 h-8 w-8 rounded-full border-4 border-slate-900 flex items-center justify-center transition-colors duration-300",
              isActive ? "bg-green-500" : "bg-slate-500"
            )}>
              {isActive ? <Mic size={14} className="text-white animate-pulse" /> : <Mic size={14} className="text-white/50" />}
            </div>
          </div>
        </div>

        <div className="h-8 flex items-center justify-center">
          {isActive ? (
             isSpeaking ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-3 bg-primary rounded-full animate-[music-bar_0.5s_ease-in-out_infinite]"></span>
                  <span className="w-1 h-5 bg-primary rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.1s]"></span>
                  <span className="w-1 h-4 bg-primary rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]"></span>
                  <span className="ml-2 text-primary font-medium tracking-widest text-xs uppercase">Speaking</span>
                </div>
             ) : (
                <span className="text-slate-400 text-xs tracking-wider uppercase">Listening...</span>
             )
          ) : (
            <span className="text-slate-500 text-xs">Ready to connect</span>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
            <span className="block w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {error}
          </div>
        )}

        <div className="flex gap-4">
          {!isActive ? (
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-500 text-white rounded-full px-8 shadow-lg shadow-green-900/20 h-12 text-base font-semibold transition-all hover:scale-105 active:scale-95"
              onClick={startCall}
            >
              <Phone className="mr-2 h-5 w-5" />
              Join Call
            </Button>
          ) : (
            <Button 
              size="lg" 
              variant="destructive"
              className="rounded-full px-8 shadow-lg shadow-red-900/20 h-12 text-base font-semibold hover:bg-red-600"
              onClick={endCall}
            >
              <PhoneOff className="mr-2 h-5 w-5" />
              End Call
            </Button>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes music-bar {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
}