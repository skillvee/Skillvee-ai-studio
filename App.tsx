import React, { useState } from 'react';
import { SCENARIO_DATA, COWORKERS_DATA } from './lib/mock-data';
import { useChat } from './hooks/use-chat';
import { Sidebar } from './components/layout/sidebar';
import { Header } from './components/layout/header';
import { DashboardView } from './components/assessment/dashboard-view';
import { ChatInterface } from './components/chat/chat-interface';
import { DefenseView } from './components/defense/defense-view';

type ViewState = 'dashboard' | 'chat' | 'defense';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [activeCoworkerId, setActiveCoworkerId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const scenario = SCENARIO_DATA;
  const coworkers = COWORKERS_DATA;
  const manager = coworkers.find(c => c.role.includes("Manager")) || coworkers[0];

  const { chats, typing, sendMessage } = useChat(coworkers, scenario);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        view={view}
        onNavigate={setView}
        activeCoworkerId={activeCoworkerId}
        onSelectCoworker={setActiveCoworkerId}
        coworkers={coworkers}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-muted/30">
        <Header 
          onToggleSidebar={() => setSidebarOpen(true)}
          view={view}
          activeCoworker={coworkers.find(c => c.id === activeCoworkerId)}
        />

        <div className="flex-1 overflow-hidden relative">
          {view === 'dashboard' && <DashboardView scenario={scenario} />}
          
          {view === 'chat' && activeCoworkerId && (
            <ChatInterface 
              coworker={coworkers.find(c => c.id === activeCoworkerId)!}
              messages={chats[activeCoworkerId] || []}
              onSendMessage={(text) => sendMessage(activeCoworkerId, text)}
              isTyping={typing[activeCoworkerId]}
            />
          )}

          {view === 'defense' && (
            <DefenseView 
              manager={manager} 
              scenario={scenario} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
