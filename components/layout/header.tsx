import React from 'react';
import { Menu } from 'lucide-react';
import { Badge } from '../ui/index';
import { Coworker, AssessmentStatus } from '../../types/index';

interface HeaderProps {
  onToggleSidebar: () => void;
  view: 'chat' | 'defense';
  activeCoworker: Coworker | undefined;
  assessmentStatus?: AssessmentStatus;
}

export function Header({ onToggleSidebar, view, activeCoworker, assessmentStatus }: HeaderProps) {
  // Global header is now only for mobile navigation toggle.
  // On desktop, the sidebar + main content (with its own header) is sufficient.
  
  return (
    <header className="flex md:hidden h-14 items-center gap-4 border-b border-transparent px-4 shrink-0 z-10 bg-white border-slate-100">
      <button onClick={onToggleSidebar} className="text-slate-500 hover:text-slate-900">
        <Menu size={20} />
      </button>
      
      <div className="flex-1">
         {view === 'defense' && <span className="text-sm font-bold text-slate-900">Review Call</span>}
         {view === 'chat' && activeCoworker && <span className="text-sm font-bold text-slate-900">{activeCoworker.name}</span>}
      </div>
    </header>
  );
}