import React from 'react';
import { LayoutDashboard, Phone, X, Headphones } from 'lucide-react';
import { Button, Avatar, AvatarImage, AvatarFallback, ScrollArea } from '../ui/index';
import { cn } from '../../lib/utils';
import { Coworker, Message, AssessmentStatus } from '../../types/index';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'chat' | 'defense';
  onNavigate: (view: 'chat' | 'defense') => void;
  activeCoworkerId: string | null;
  onSelectCoworker: (id: string | null) => void;
  coworkers: Coworker[];
  chats?: Record<string, Message[]>;
  assessmentStatus?: AssessmentStatus;
  prUrl?: string | null;
}

export function Sidebar({ isOpen, onClose, view, onNavigate, activeCoworkerId, onSelectCoworker, coworkers, chats, assessmentStatus, prUrl }: SidebarProps) {
  return (
    <>
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#237CF1] flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
              S
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Skillvee</span>
          </div>
          <button 
            onClick={onClose}
            className="ml-auto md:hidden text-slate-400 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-8">
            
            {/* Team List */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Team</span>
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px]">ONLINE</span>
              </div>
              <div className="space-y-1">
                {coworkers.map(cw => {
                  const isActive = activeCoworkerId === cw.id;
                  const hasMessages = chats?.[cw.id] && chats[cw.id].length > 0;
                  
                  return (
                    <button
                      key={cw.id}
                      onClick={() => {
                        onSelectCoworker(cw.id);
                        onNavigate('chat');
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 group relative",
                        isActive 
                          ? "bg-[#237CF1]/10 text-[#237CF1] ring-1 ring-[#237CF1]/20" 
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                          <AvatarImage src={cw.avatarUrl} />
                          <AvatarFallback className="bg-slate-100 text-slate-500 text-xs font-bold">{cw.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-sm font-semibold truncate", isActive ? "text-[#237CF1]" : "text-slate-900")}>
                          {cw.name}
                        </div>
                        <div className={cn("text-[10px] truncate", isActive ? "text-[#237CF1]/80" : "text-slate-400")}>
                          {cw.role}
                        </div>
                      </div>

                      <div className={cn(
                        "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                        isActive ? "bg-[#237CF1] text-white" : "bg-slate-200 text-slate-500 hover:bg-[#237CF1] hover:text-white"
                      )}>
                        <Headphones size={12} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
           <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
             <span>v1.2.0</span>
             {assessmentStatus && (
               <span className={cn(
                 "px-1.5 py-0.5 rounded border uppercase",
                 assessmentStatus === 'WORKING' ? "bg-green-50 text-green-600 border-green-200" : "bg-slate-100 border-slate-200"
               )}>
                 {assessmentStatus}
               </span>
             )}
           </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}