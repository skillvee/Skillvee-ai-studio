import { GoogleGenAI } from "@google/genai";

const PR_ACKNOWLEDGMENT_PROMPT = `You are an engineering manager. The candidate just submitted their PR link for review in Slack.

Generate a short, friendly response (1-2 sentences). 
CRITICAL: You must explicitly say that you are calling them RIGHT NOW to discuss it.

Examples:
- "Nice! Received. Calling you now to go over it."
- "Fast work! Let me give you a quick call to walk through the changes."
- "Got it. I'll dial you in a sec to do a quick live review."

PR URL: {prUrl}

Respond with ONLY the message text.`;

export async function generatePRAcknowledgment(
  managerName: string,
  prUrl: string
): Promise<string> {
  const API_KEY = process.env.API_KEY || '';

  if (!API_KEY) {
    // Fallback if no API key
    return "Got it! Calling you now to walk through it together.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{ text: PR_ACKNOWLEDGMENT_PROMPT.replace('{prUrl}', prUrl) }]
      }],
    });

    return response.text?.trim() || "Received. Calling you now to discuss.";
  } catch (e) {
    console.error('Failed to generate PR acknowledgment:', e);
    return "Thanks! Calling you now to go over the PR.";
  }
}