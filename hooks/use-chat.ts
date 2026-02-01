import { useState } from 'react';
import { Message, Coworker, Scenario } from '../types/index';
import { generateCoworkerResponse } from '../lib/ai/gemini';

export function useChat(coworkers: Coworker[], scenario: Scenario) {
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [typing, setTyping] = useState<Record<string, boolean>>({});

  const sendMessage = async (coworkerId: string, text: string) => {
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
      const responseText = await generateCoworkerResponse(
        coworker,
        updatedHistory,
        text,
        scenario
      );

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
  };

  return { chats, typing, sendMessage };
}
