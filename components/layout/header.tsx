import React from 'react';
import { Menu } from 'lucide-react';
import { Badge, Avatar, AvatarImage, AvatarFallback } from '../ui/index';
import { Coworker } from '../../types/index';

interface HeaderProps {
  onToggleSidebar: () => void;
  view: 'dashboard' | 'chat' | 'defense';
  activeCoworker: Coworker | undefined;
}

export function Header({ onToggleSidebar, view, activeCoworker }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 md:px-6 shrink-0 z-10 shadow-sm">
      <button onClick={onToggleSidebar} className="md:hidden text-muted-foreground hover:text-foreground">
        <Menu size={20} />
      </button>
      <div className="flex-1 font-semibold text-foreground flex items-center">
         {view === 'dashboard' && <span className="text-lg tracking-tight">Project Overview</span>}
         {view === 'chat' && activeCoworker && (
           <div className="flex items-center gap-3">
             <Avatar className="h-8 w-8 border">
                <AvatarImage src={activeCoworker.avatarUrl} />
                <AvatarFallback>{activeCoworker.name[0]}</AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
               <span className="text-sm font-semibold leading-none">{activeCoworker.name}</span>
               <span className="text-[10px] text-muted-foreground font-normal mt-0.5">{activeCoworker.role}</span>
             </div>
           </div>
         )}
         {view === 'defense' && <span className="text-lg tracking-tight">Code Review Call</span>}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="hidden sm:flex font-mono text-xs bg-slate-100 text-slate-600">
          branch: feature/rate-limiting
        </Badge>
      </div>
    </header>
  );
}
