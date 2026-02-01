import { useState, useCallback } from 'react';
import { Message, Coworker, Scenario, AssessmentState } from '../types/index';
import { generateCoworkerResponse } from '../lib/ai/gemini';
import { generatePRAcknowledgment } from '../lib/ai/pr-acknowledgment';

export function useChat(coworkers: Coworker[], scenario: Scenario) {
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [typing, setTyping] = useState<Record<string, boolean>>({});

  // Check if text contains a valid PR URL
  const extractPRUrl = useCallback((text: string): string | null => {
    const patterns = [
      /https?:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+/,
      /https?:\/\/gitlab\.com\/[\w-]+\/[\w-]+\/-\/merge_requests\/\d+/,
      /https?:\/\/bitbucket\.org\/[\w-]+\/[\w-]+\/pull-requests\/\d+/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return null;
  }, []);

  const sendMessage = useCallback(async (
    coworkerId: string,
    text: string,
    assessmentState?: AssessmentState,
    onPRDetected?: (url: string) => void
  ) => {
    if (!text.trim()) return;
    const coworker = coworkers.find(c => c.id === coworkerId);
    if (!coworker) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text,
      timestamp: new Date(),
      senderName: 'You'
    };

    const updatedHistory = [...(chats[coworkerId] || []), newMessage];
    setChats(prev => ({ ...prev, [coworkerId]: updatedHistory }));
    setTyping(prev => ({ ...prev, [coworkerId]: true }));

    try {
      const isManager = coworker.role.toLowerCase().includes('manager');
      const prUrl = extractPRUrl(text);
      const isNewPRSubmission = isManager && prUrl && !assessmentState?.prUrl;

      let responseText: string;

      if (isNewPRSubmission && prUrl) {
        // PR submitted to manager for the first time - generate acknowledgment
        responseText = await generatePRAcknowledgment(coworker.name, prUrl);

        // Notify parent about PR detection
        if (onPRDetected) {
          onPRDetected(prUrl);
        }
      } else if (isManager && prUrl && assessmentState?.prUrl) {
        // PR already submitted, duplicate
        responseText = "Got it! I already have your PR saved. Ready whenever you want to hop on a call to walk me through it.";
      } else {
        // Regular conversation
        responseText = await generateCoworkerResponse(
          coworker,
          updatedHistory,
          text,
          scenario,
          'Candidate',
          null,
          chats,
          coworkers
        );
      }

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        senderName: coworker.name
      };

      setChats(prev => ({
        ...prev,
        [coworkerId]: [...updatedHistory, aiMessage]
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setTyping(prev => ({ ...prev, [coworkerId]: false }));
    }
  }, [coworkers, chats, extractPRUrl, scenario]);

  return { chats, setChats, typing, sendMessage };
}