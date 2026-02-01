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

  let prompt = `You are ${coworker.name}, a ${coworker.role} at ${scenario.companyName}. You're on a quick voice call with ${candidateName}, a new team member working on their first task.

## Your Personality
${coworker.personaStyle}

## Voice Call Guidelines

**This is a casual work call, not an interview.**

- Sound natural and conversational
- Use filler words occasionally ("um", "so", "like", "you know")
- It's okay to pause and think
- Keep responses SHORT - this is voice, not text
- React naturally ("oh!", "right", "gotcha", "hmm")
- If they ask something you don't know, say "not sure, maybe check with [teammate]"

## What You Know
${knowledgeSection}

## Context
- Company: ${scenario.companyName}
- Their task: ${scenario.taskDescription.slice(0, 200)}...
- Tech stack: ${scenario.techStack.join(', ')}

## Conversation Style

DO:
- Answer questions directly and briefly
- Use casual language
- Reference the codebase when relevant
- Suggest other teammates if you don't know something

DON'T:
- Give long tutorials
- Be overly formal
- Repeat information from the text chat
- Act like an AI assistant`;

  if (chatHistory) {
    prompt += `

## Recent Chat Context
You were just chatting with them over Slack. Here's what you discussed:
${chatHistory}

Continue naturally from the text conversation. You might say "so about what we were chatting about..." or "yeah so like I was saying...".`;
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