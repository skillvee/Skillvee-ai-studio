import { useState, useCallback, useRef } from 'react';
import { AssessmentState, Scenario, Coworker, Message } from '../types/index';
import { generateManagerGreeting } from '../lib/ai/manager-greeting';

interface UseAssessmentProps {
  scenario: Scenario;
  coworkers: Coworker[];
  candidateName: string;
  onManagerMessage: (managerId: string, messages: Message[]) => void;
}

export function useAssessment({
  scenario,
  coworkers,
  candidateName,
  onManagerMessage
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

    // Small delay to feel natural (like manager is typing)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const greetings = await generateManagerGreeting(manager, scenario, candidateName);

    // Convert to Message objects and send with staggered timing
    for (let i = 0; i < greetings.length; i++) {
      // Stagger messages by 1-2 seconds each
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      }

      const msg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: greetings[i],
        timestamp: new Date(),
        senderName: manager.name,
      };

      // Send each message as it's "typed"
      onManagerMessage(manager.id, [msg]);
    }

    setState(prev => ({
      ...prev,
      status: 'WORKING',
      managerMessagesStarted: true,
    }));
  }, [manager, scenario, candidateName, state.managerMessagesStarted, onManagerMessage]);

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