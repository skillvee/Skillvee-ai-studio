import { useState, useCallback, useRef } from 'react';
import { AssessmentState, Scenario, Coworker, Message } from '../types/index';
import { generateManagerGreeting } from '../lib/ai/manager-greeting';

interface UseAssessmentProps {
  scenario: Scenario;
  coworkers: Coworker[];
  candidateName: string;
  onManagerMessage: (managerId: string, messages: Message[]) => void;
  onTyping: (managerId: string, isTyping: boolean) => void;
}

export function useAssessment({
  scenario,
  coworkers,
  candidateName,
  onManagerMessage,
  onTyping
}: UseAssessmentProps) {
  const [state, setState] = useState<AssessmentState>({
    id: crypto.randomUUID(),
    status: 'WELCOME',
    scenarioId: scenario.id,
    candidateName,
    prUrl: null,
    managerMessagesStarted: false,
    defenseCallStarted: false,
    startedAt: new Date(),
    completedAt: null,
  });

  const greetingStartedRef = useRef(false);

  const manager = coworkers.find(c =>
    c.role.toLowerCase().includes('manager')
  );

  // Start the assessment (trigger manager greeting)
  const startAssessment = useCallback(async () => {
    if (!manager || state.managerMessagesStarted || greetingStartedRef.current) return;

    greetingStartedRef.current = true;
    
    // Immediately set status to working
    setState(prev => ({
      ...prev,
      status: 'WORKING',
      managerMessagesStarted: true,
    }));

    // Start "typing" immediately so user sees activity right away
    onTyping(manager.id, true);

    // Fetch messages (while typing animation plays)
    // We race the generation against a minimum delay (1.5s) to ensure the first "typing" phase feels real
    const [greetings] = await Promise.all([
      generateManagerGreeting(manager, scenario, candidateName),
      new Promise(resolve => setTimeout(resolve, 1500))
    ]);

    // Send the first message
    if (greetings.length > 0) {
      onTyping(manager.id, false);
      
      const firstMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: greetings[0],
        timestamp: new Date(),
        senderName: manager.name,
      };
      onManagerMessage(manager.id, [firstMsg]);
    }

    // Process remaining messages with realistic pauses
    for (let i = 1; i < greetings.length; i++) {
      // Small reading pause between messages (user reads previous message)
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      
      // Start typing next message
      onTyping(manager.id, true);
      
      // Typing duration based on text length (approx 30ms per char), but capped
      const text = greetings[i];
      const typingDuration = Math.min(3500, Math.max(1200, text.length * 30));
      await new Promise(resolve => setTimeout(resolve, typingDuration));
      
      // Send message
      onTyping(manager.id, false);
      
      const msg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: text,
        timestamp: new Date(),
        senderName: manager.name,
      };
      onManagerMessage(manager.id, [msg]);
    }

  }, [manager, scenario, candidateName, state.managerMessagesStarted, onManagerMessage, onTyping]);

  // Submit PR URL
  const submitPR = useCallback((url: string) => {
    setState(prev => ({
      ...prev,
      prUrl: url,
    }));
  }, []);

  // Mark defense call as started
  const markDefenseCallStarted = useCallback(() => {
    setState(prev => ({
      ...prev,
      defenseCallStarted: true,
    }));
  }, []);

  // Complete assessment
  const completeAssessment = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'COMPLETED',
      completedAt: new Date(),
    }));
  }, []);

  return {
    state,
    manager,
    startAssessment,
    submitPR,
    markDefenseCallStarted,
    completeAssessment,
  };
}