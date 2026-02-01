import React, { useState, useCallback } from 'react';
import { SCENARIO_DATA, COWORKERS_DATA } from './lib/mock-data';
import { useChat } from './hooks/use-chat';
import { useAssessment } from './hooks/use-assessment';
import { Sidebar } from './components/layout/sidebar';
import { Header } from './components/layout/header';
import { WelcomeView } from './components/assessment/welcome-view';
import { DashboardView } from './components/assessment/dashboard-view';
import { ChatInterface } from './components/chat/chat-interface';
import { DefenseView } from './components/defense/defense-view';
import { Message } from './types/index';

type ViewState = 'welcome' | 'dashboard' | 'chat' | 'defense';

export default function App() {
  const [view, setView] = useState<ViewState>('welcome');
  const [activeCoworkerId, setActiveCoworkerId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scenario = SCENARIO_DATA;
  const coworkers = COWORKERS_DATA;

  const { chats, setChats, typing, sendMessage } = useChat(coworkers, scenario);

  // Handle manager messages from assessment hook
  const handleManagerMessage = useCallback((managerId: string, messages: Message[]) => {
    setChats(prev => ({
      ...prev,
      [managerId]: [...(prev[managerId] || []), ...messages]
    }));
  }, [setChats]);

  const {
    state: assessmentState,
    manager,
    startAssessment,
    submitPR,
  } = useAssessment({
    scenario,
    coworkers,
    candidateName: 'Candidate', // Could come from auth
    onManagerMessage: handleManagerMessage,
  });

  // When user clicks "Start Assessment" on welcome screen
  const handleStartAssessment = useCallback(async () => {
    setView('dashboard');
    // Trigger manager greeting after a moment
    setTimeout(() => {
      startAssessment();
      // Auto-navigate to manager chat after greeting starts
      if (manager) {
        setTimeout(() => {
          setActiveCoworkerId(manager.id);
          setView('chat');
        }, 3000);
      }
    }, 1000);
  }, [startAssessment, manager]);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {view === 'welcome' ? (
        <WelcomeView
          scenario={scenario}
          onStart={handleStartAssessment}
        />
      ) : (
        <>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            view={view}
            onNavigate={(v) => setView(v as ViewState)}
            activeCoworkerId={activeCoworkerId}
            onSelectCoworker={(id) => {
              setActiveCoworkerId(id);
              setView('chat');
            }}
            coworkers={coworkers}
            chats={chats}
            assessmentStatus={assessmentState.status}
            prUrl={assessmentState.prUrl}
          />

          <main className="flex-1 flex flex-col min-w-0 bg-muted/30">
            <Header
              onToggleSidebar={() => setSidebarOpen(true)}
              view={view}
              activeCoworker={coworkers.find(c => c.id === activeCoworkerId)}
              assessmentStatus={assessmentState.status}
            />

            <div className="flex-1 overflow-hidden relative">
              {view === 'dashboard' && <DashboardView scenario={scenario} />}

              {view === 'chat' && activeCoworkerId && (
                <ChatInterface
                  coworker={coworkers.find(c => c.id === activeCoworkerId)!}
                  messages={chats[activeCoworkerId] || []}
                  onSendMessage={(text) => sendMessage(
                    activeCoworkerId, 
                    text,
                    assessmentState,
                    (prUrl) => submitPR(prUrl)
                  )}
                  isTyping={typing[activeCoworkerId]}
                  assessmentState={assessmentState}
                  scenario={scenario}
                />
              )}

              {view === 'defense' && manager && (
                <DefenseView
                  manager={manager}
                  scenario={scenario}
                  prUrl={assessmentState.prUrl}
                />
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
}