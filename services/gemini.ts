import { GoogleGenAI } from "@google/genai";
import { Message, Coworker, Scenario } from "../types";
import { buildCoworkerBasePrompt, buildDefensePrompt } from "../constants";

export async function generateCoworkerResponse(
  coworker: Coworker,
  history: Message[],
  lastUserMessage: string,
  scenario: Scenario,
  candidateName: string = "Candidate",
  prUrl: string | null = null
): Promise<string> {
  const isManager = coworker.role.toLowerCase().includes("manager");
  const isDefense = isManager && !!prUrl;

  // Initialize AI client per request to ensure latest API Key is used
  const API_KEY = process.env.API_KEY || ''; 
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  let systemPrompt = "";
  
  if (isDefense && prUrl) {
    systemPrompt = buildDefensePrompt({
      managerName: coworker.name,
      managerRole: coworker.role,
      companyName: scenario.companyName,
      candidateName,
      taskDescription: scenario.taskDescription,
      techStack: scenario.techStack,
      repoUrl: scenario.repoUrl,
      prUrl
    });
  } else {
    systemPrompt = buildCoworkerBasePrompt(coworker, {
      companyName: scenario.companyName,
      candidateName,
      taskDescription: scenario.taskDescription,
      techStack: scenario.techStack
    });
  }

  // Transform internal message format to Gemini API format
  const contentParts = [
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    { role: "user", parts: [{ text: lastUserMessage }] },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contentParts,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the company server right now.";
  }
}