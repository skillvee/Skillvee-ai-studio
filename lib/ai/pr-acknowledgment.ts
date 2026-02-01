import { GoogleGenAI } from "@google/genai";

const PR_ACKNOWLEDGMENT_PROMPT = `You are an engineering manager. The candidate just submitted their PR link for review.

Generate a short, warm acknowledgment (2-3 sentences max). Include:
1. Thanks/acknowledgment that you received the PR
2. Mention you'll take a quick look
3. Say you'll call them to discuss

Sound like a real manager on Slack - casual, friendly, brief. Don't be over-the-top enthusiastic.

Examples of good responses:
- "Nice! Got your PR. Let me take a quick look and I'll ping you for a call in a few."
- "Sweet, thanks for submitting! I'll review this real quick and then we can hop on a call to go through it."
- "Got it! Let me pull this up and take a peek. I'll call you shortly to chat about your approach."

PR URL: {prUrl}

Respond with ONLY the acknowledgment message, nothing else.`;

export async function generatePRAcknowledgment(
  managerName: string,
  prUrl: string
): Promise<string> {
  const API_KEY = process.env.API_KEY || '';

  if (!API_KEY) {
    // Fallback if no API key
    return "Got it! Let me take a look at your PR. I'll call you in a few to discuss your approach.";
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

    return response.text?.trim() || "Got it! Let me review your PR and I'll call you to discuss.";
  } catch (e) {
    console.error('Failed to generate PR acknowledgment:', e);
    return "Thanks for submitting! I'll take a look and give you a call to go over it.";
  }
}