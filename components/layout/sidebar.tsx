import React from 'react';
import { LayoutDashboard, Phone, X } from 'lucide-react';
import { Button, Avatar, AvatarImage, AvatarFallback, ScrollArea } from '../ui/index';
import { cn } from '../../lib/utils';
import { Coworker, Message, AssessmentStatus } from '../../types/index';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'dashboard' | 'chat' | 'defense';
  onNavigate: (view: 'dashboard' | 'chat' | 'defense') => void;
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b border-slate-800 px-4 shrink-0">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xs text-white">S</span>
            </div>
            <span>Skillvee</span>
          </div>
          <button 
            onClick={onClose}
            className="ml-auto md:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <div>
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Workspace
              </div>
              <Button
                variant={view === 'dashboard' ? 'secondary' : 'ghost'}
                className={cn("w-full justify-start gap-2 h-9", view === 'dashboard' ? "bg-slate-800 text-white hover:bg-slate-800" : "hover:bg-slate-800/50 hover:text-white")}
                onClick={() => {
                  onNavigate('dashboard');
                  onSelectCoworker(null);
                  onClose();
                }}
              >
                <LayoutDashboard size={16} />
                Project Brief
              </Button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Team</span>
              </div>
              <div className="space-y-1">
                {coworkers.map(cw => {
                  const hasMessages = chats?.[cw.id] && chats[cw.id].length > 0;
                  const isUnread = hasMessages && cw.id !== activeCoworkerId;
                  
                  return (
                    <Button
                      key={cw.id}
                      variant={activeCoworkerId === cw.id ? 'secondary' : 'ghost'}
                      className={cn(
                        "w-full justify-start gap-2 relative h-10 group",
                        activeCoworkerId === cw.id ? "bg-slate-800 text-white hover:bg-slate-800" : "hover:bg-slate-800/50 hover:text-white"
                      )}
                      onClick={() => {
                        onSelectCoworker(cw.id);
                        onNavigate('chat');
                        onClose();
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-6 w-6 border border-slate-600/50">
                          <AvatarImage src={cw.avatarUrl} />
                          <AvatarFallback className="bg-slate-700 text-[10px]">{cw.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className={cn("absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full ring-2 ring-slate-900", cw.isOnline ? "bg-green-500" : "bg-slate-500")} />
                      </div>
                      <span className={cn("truncate text-sm flex-1 text-left", isUnread && "font-semibold text-white")}>{cw.name}</span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Evaluation
              </div>
              <Button
                variant={view === 'defense' ? 'default' : 'outline'}
                disabled={!prUrl}
                className={cn(
                  "w-full justify-start gap-2 border-slate-700 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  view === 'defense' && "bg-primary hover:bg-primary/90 text-white border-transparent shadow-[0_0_15px_-3px_rgba(35,124,241,0.4)]"
                )}
                onClick={() => {
                  onNavigate('defense');
                  onSelectCoworker(null);
                  onClose();
                }}
              >
                <Phone size={16} />
                {prUrl ? 'Start Defense Call' : 'Submit PR First'}
              </Button>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 flex justify-between">
           <span>v1.0.0 • Simulator</span>
           {assessmentStatus && <span className="uppercase text-slate-500">{assessmentStatus}</span>}
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
}