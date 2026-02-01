import React, { useState, useCallback } from 'react';
import { SCENARIO_DATA, COWORKERS_DATA } from './lib/mock-data';
import { useChat } from './hooks/use-chat';
import { useAssessment } from './hooks/use-assessment';
import { useScreenRecorder } from './hooks/use-screen-recorder';
import { Sidebar } from './components/layout/sidebar';
import { Header } from './components/layout/header';
import { ChatInterface } from './components/chat/chat-interface';
import { JoinSimulation } from './components/landing/join-simulation';
import { RecordingConsentModal } from './components/recording/recording-consent-modal';
import { RecordingStoppedModal } from './components/recording/recording-stopped-modal';
import { ResultsView } from './components/results/results-view';
import { Message } from './types/index';

type ViewState = 'welcome' | 'chat';

export default function App() {
  const [view, setView] = useState<ViewState>('welcome');
  const [activeCoworkerId, setActiveCoworkerId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoStartCall, setAutoStartCall] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const scenario = SCENARIO_DATA;
  const coworkers = COWORKERS_DATA;

  // Screen Recorder Hook
  const { 
    startRecording, 
    resumeRecording, 
    status: recordingStatus,
    error: recorderError,
    screenshots,
    videoBlob 
  } = useScreenRecorder();

  const { chats, setChats, typing, setTyping, sendMessage } = useChat(coworkers, scenario);

  // Handle manager messages from assessment hook
  const handleManagerMessage = useCallback((managerId: string, messages: Message[]) => {
    setChats(prev => ({
      ...prev,
      [managerId]: [...(prev[managerId] || []), ...messages]
    }));
  }, [setChats]);

  // Handle manual typing state updates from assessment hook
  const handleTyping = useCallback((managerId: string, isTyping: boolean) => {
    setTyping(prev => ({
      ...prev,
      [managerId]: isTyping
    }));
  }, [setTyping]);

  const {
    state: assessmentState,
    manager,
    startAssessment,
    submitPR,
    markDefenseCallStarted,
    completeAssessment
  } = useAssessment({
    scenario,
    coworkers,
    candidateName: 'Candidate',
    onManagerMessage: handleManagerMessage,
    onTyping: handleTyping,
  });

  // Called when user clicks "Start" on the Landing Page
  const handleInitiateStart = useCallback(() => {
    setShowConsentModal(true);
  }, []);

  // Called after Permission is granted via Modal
  const handleRecordingConfirmed = useCallback(async () => {
    const success = await startRecording();
    if (success) {
      setShowConsentModal(false);
      
      // Navigate to chat
      if (manager) {
        setActiveCoworkerId(manager.id);
        setView('chat');
      }
      
      // Start the assessment logic (AI messages)
      startAssessment();
    }
  }, [startRecording, startAssessment, manager]);

  const handleResumeRecording = useCallback(async () => {
    await resumeRecording();
  }, [resumeRecording]);

  const handleRestart = () => {
    window.location.reload();
  };

  // If assessment is completed, show Results Page
  if (assessmentState.status === 'COMPLETED') {
    // Flatten all chats into a single timeline for context
    const fullChatHistory = Object.values(chats).flat().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return (
      <ResultsView 
        onRestart={handleRestart} 
        screenshots={screenshots}
        chatHistory={fullChatHistory}
        videoBlob={videoBlob}
      />
    );
  }

  // If in welcome state, show the landing page experience
  if (view === 'welcome') {
    return (
      <>
        <JoinSimulation scenario={scenario} onStart={handleInitiateStart} />
        <RecordingConsentModal 
          isOpen={showConsentModal} 
          onConfirm={handleRecordingConfirmed}
          error={recorderError}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
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
        onStartCall={(id) => {
          setActiveCoworkerId(id);
          setView('chat');
          setAutoStartCall(true);
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
              onDefenseCallStarted={markDefenseCallStarted}
              shouldStartCall={autoStartCall}
              onCallStartHandled={() => setAutoStartCall(false)}
              onAssessmentComplete={completeAssessment}
            />
          )}
        </div>
      </main>

      {/* Force resume if interrupted during active assessment */}
      <RecordingStoppedModal 
        isOpen={recordingStatus === 'interrupted' || recordingStatus === 'denied'} 
        onResume={handleResumeRecording}
      />
    </div>
  );
}