import { Message, Coworker } from '../../types/index';

interface ConversationSummary {
  coworkerName: string;
  coworkerRole: string;
  topicsDiscussed: string;
  messageCount: number;
}

/**
 * Build a summary of all conversations EXCEPT the current coworker
 * This gives context about what the candidate has discussed with the team
 */
export function buildCrossCoworkerContext(
  currentCoworkerId: string,
  allChats: Record<string, Message[]>,
  coworkers: Coworker[]
): string {
  const summaries: ConversationSummary[] = [];

  for (const [coworkerId, messages] of Object.entries(allChats)) {
    // Skip current coworker and empty chats
    if (coworkerId === currentCoworkerId || messages.length === 0) continue;

    const coworker = coworkers.find(c => c.id === coworkerId);
    if (!coworker) continue;

    // Get user messages to understand what candidate asked about
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.text)
      .join(' ');

    // Simple topic extraction - look for key patterns
    const topics = extractTopics(userMessages, coworker);

    summaries.push({
      coworkerName: coworker.name,
      coworkerRole: coworker.role,
      topicsDiscussed: topics || 'general questions',
      messageCount: messages.length,
    });
  }

  if (summaries.length === 0) {
    return ''; // No other conversations yet
  }

  // Build the context string
  let context = '\n\n## Team Context\n\n';
  context += 'The candidate has been chatting with other team members:\n\n';

  for (const summary of summaries) {
    context += `- **${summary.coworkerName}** (${summary.coworkerRole}): Discussed ${summary.topicsDiscussed} (${summary.messageCount} messages)\n`;
  }

  context += '\nYou can reference these conversations naturally, like "Oh you talked to Sarah? She knows that stuff well" or "Mike probably told you about the Redis wrapper already".\n';

  return context;
}

/**
 * Extract likely topics from user messages
 */
function extractTopics(text: string, coworker: Coworker): string {
  const lowerText = text.toLowerCase();
  const topics: string[] = [];

  // Check against coworker's knowledge triggers
  for (const knowledge of coworker.knowledge) {
    for (const keyword of knowledge.triggerKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        topics.push(knowledge.topic);
        break;
      }
    }
  }

  // Common tech topics
  const techKeywords: Record<string, string> = {
    'auth': 'authentication',
    'jwt': 'authentication',
    'token': 'authentication',
    'redis': 'Redis/caching',
    'cache': 'caching',
    'database': 'database',
    'db': 'database',
    'api': 'API',
    'endpoint': 'API endpoints',
    'test': 'testing',
    'deploy': 'deployment',
    'docker': 'Docker/containers',
    'git': 'git workflow',
    'pr': 'pull requests',
    'review': 'code review',
    'bug': 'debugging',
    'error': 'troubleshooting',
  };

  for (const [keyword, topic] of Object.entries(techKeywords)) {
    if (lowerText.includes(keyword) && !topics.includes(topic)) {
      topics.push(topic);
    }
  }

  // Limit to top 3 topics
  return topics.slice(0, 3).join(', ') || '';
}

/**
 * Get a brief summary of the most recent exchange with a coworker
 * Used when you want to reference specific recent info
 */
export function getRecentExchangeSummary(
  messages: Message[],
  maxMessages: number = 4
): string {
  if (messages.length === 0) return '';

  const recent = messages.slice(-maxMessages);
  const exchanges = recent.map(m =>
    `${m.role === 'user' ? 'Candidate' : m.senderName}: "${m.text.slice(0, 100)}${m.text.length > 100 ? '...' : ''}"`
  ).join('\n');

  return exchanges;
}