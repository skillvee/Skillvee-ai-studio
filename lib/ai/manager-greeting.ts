import { GoogleGenAI } from "@google/genai";
import { Scenario, Coworker } from "../../types/index";

const GREETING_PROMPT = `You are a friendly engineering manager sending the first messages to a new team member on Slack. They just joined and you're giving them their first task.

Generate 2-3 short, natural Slack messages (NOT one big message). Each message should be 1-2 sentences max.

Message 1: Quick friendly greeting
Message 2: Brief intro to the task
Message 3 (optional): Offer to help / mention the team

Context:
- Your name: {managerName}
- Company: {companyName}
- Task: {taskDescription}
- Tech stack: {techStack}
- Repo: {repoUrl}

Rules:
- Sound like a real person on Slack, not formal
- Use casual language ("hey", "btw", "lmk")
- Keep each message SHORT
- Don't over-explain the task - they'll figure it out
- End with something like "ping me or the team if you need anything"

Return ONLY a JSON array of message strings, nothing else:
["message 1", "message 2", "message 3"]`;

export async function generateManagerGreeting(
  manager: Coworker,
  scenario: Scenario,
  candidateName: string
): Promise<string[]> {
  const API_KEY = process.env.API_KEY || '';

  if (!API_KEY) {
    // Fallback messages if no API key
    return [
      `Hey ${candidateName}! Welcome to the team 👋`,
      `So your first task - we need ${scenario.taskDescription.slice(0, 100)}... Check out the repo: ${scenario.repoUrl}`,
      `Ping me or anyone on the team if you get stuck. We're here to help!`
    ];
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = GREETING_PROMPT
    .replace('{managerName}', manager.name)
    .replace('{companyName}', scenario.companyName)
    .replace('{taskDescription}', scenario.taskDescription)
    .replace('{techStack}', scenario.techStack.join(', '))
    .replace('{repoUrl}', scenario.repoUrl);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '[]';
    // Clean potential markdown just in case, though MIME type handles most
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const messages = JSON.parse(cleaned);

    if (Array.isArray(messages) && messages.length > 0) {
      return messages;
    }
  } catch (e) {
    console.error('Failed to generate greeting:', e);
  }

  // Fallback
  return [
    `Hey ${candidateName}! Welcome aboard 🎉`,
    `Your first task: ${scenario.taskDescription.slice(0, 80)}... The repo is at ${scenario.repoUrl}`,
    `Hit me up if you have questions!`
  ];
}