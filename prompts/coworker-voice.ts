import { Coworker, Scenario } from '../types/index';

interface VoicePromptContext {
  coworker: Coworker;
  scenario: Scenario;
  candidateName: string;
  chatHistory?: string; // Summary of recent chat
}

export function buildCoworkerVoicePrompt(context: VoicePromptContext): string {
  const { coworker, scenario, candidateName, chatHistory } = context;

  const knowledgeSection = coworker.knowledge.length > 0
    ? coworker.knowledge.map(k =>
        `- ${k.topic}: ${k.response}`
      ).join('\n')
    : 'General knowledge about your role.';

  let prompt = `You are ${coworker.name}, a ${coworker.role} at ${scenario.companyName}. You're on a quick, casual voice call with ${candidateName}.

## Your Personality
${coworker.personaStyle}

## CRITICAL VOICE INSTRUCTIONS
1. **Be Concise**: Keep answers to 1-2 sentences. Do NOT monologue.
2. **Be Natural**: Use fillers ("um", "like", "so"), simple words, and contractions.
3. **Be Reactive**: If the user interrupts, stop talking. If they say something cool, sound excited.
4. **Don't Over-Help**: You're a busy coworker, not a tutorial bot. Give a hint, not the whole solution.

## Context
- Company: ${scenario.companyName}
- Their task: ${scenario.taskDescription}
- Tech stack: ${scenario.techStack.join(', ')}

## Knowledge Base
${knowledgeSection}

## Interaction Style
- Start by saying "Hey, what's up?" or "Hey, you wanted to chat?"
- If you don't know something, suggest asking someone else.
- Reference the code/task only if they ask.`;

  if (chatHistory) {
    prompt += `

## Recent Text Chat Context
(You were just chatting on Slack. Use this context to continue the conversation naturally.)
${chatHistory}

For example, say "So about what we were just messaging about..."`;
  }

  return prompt;
}

/**
 * Get a brief summary of recent chat for voice context
 */
export function summarizeChatForVoice(messages: { role: string; text: string }[], maxMessages = 6): string {
  if (messages.length === 0) return '';

  const recent = messages.slice(-maxMessages);
  return recent.map(m =>
    `${m.role === 'user' ? 'Candidate' : 'You'}: "${m.text.slice(0, 100)}${m.text.length > 100 ? '...' : ''}"`
  ).join('\n');
}