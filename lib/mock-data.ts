import { Coworker, Scenario } from '../types/index';

export const SCENARIO_DATA: Scenario = {
  id: "sc_123",
  companyName: "FinTech Sol",
  companyDescription: "A fast-growing fintech startup modernizing payment processing.",
  taskDescription: "Implement a rate-limiting middleware for our API to prevent abuse. The current implementation allows unlimited requests. We need a sliding window implementation using Redis (mocked). Also, add unit tests.",
  techStack: ["TypeScript", "Node.js", "Express", "Redis"],
  repoUrl: "github.com/fintech-sol/payment-api"
};

export const COWORKERS_DATA: Coworker[] = [
  {
    id: "cw_manager",
    name: "Alex Rivera",
    role: "Engineering Manager",
    personaStyle: "Direct, supportive, focused on scalability and code quality. Busy but makes time.",
    avatarUrl: "https://picsum.photos/200/200?random=1",
    voiceName: "Orus",
    isOnline: true,
    knowledge: []
  },
  {
    id: "cw_senior",
    name: "Sarah Chen",
    role: "Senior Backend Engineer",
    personaStyle: "Extremely knowledgeable, helpful but expects you to read docs first. Uses lot of dev slang.",
    avatarUrl: "https://picsum.photos/200/200?random=2",
    voiceName: "Aoede",
    isOnline: true,
    knowledge: [
      { topic: "Redis", triggerKeywords: ["redis", "cache", "store"], response: "We use a standard Redis client wrapper in `src/lib/redis.ts`. Don't use the raw client directly.", isCritical: true },
      { topic: "Auth", triggerKeywords: ["auth", "jwt", "token"], response: "Auth is handled by the gateway, but for local dev you can use the 'dev-token' header.", isCritical: false }
    ]
  },
  {
    id: "cw_peer",
    name: "Mike Ross",
    role: "Frontend Developer",
    personaStyle: "Super chill, loves Tailwind, always down to chat but doesn't know much backend.",
    avatarUrl: "https://picsum.photos/200/200?random=3",
    voiceName: "Puck",
    isOnline: false,
    knowledge: []
  }
];
