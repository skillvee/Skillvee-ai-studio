import { GoogleGenAI } from "@google/genai";
import { Message, Coworker, Scenario } from "../../types/index";
import { buildCoworkerBasePrompt } from "../../prompts/coworker";
import { buildDefensePrompt } from "../../prompts/manager";
import { buildCrossCoworkerContext } from "./conversation-context";

export async function generateCoworkerResponse(
  coworker: Coworker,
  history: Message[],
  lastUserMessage: string,
  scenario: Scenario,
  candidateName: string = "Candidate",
  prUrl: string | null = null,
  allChats?: Record<string, Message[]>,
  allCoworkers?: Coworker[]
): Promise<string> {
  const isManager = coworker.role.toLowerCase().includes("manager");
  const isDefense = isManager && !!prUrl;

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
    // Build cross-coworker context
    const crossContext = (allChats && allCoworkers)
      ? buildCrossCoworkerContext(coworker.id, allChats, allCoworkers)
      : '';

    systemPrompt = buildCoworkerBasePrompt(coworker, {
      companyName: scenario.companyName,
      candidateName,
      taskDescription: scenario.taskDescription,
      techStack: scenario.techStack
    }, crossContext);
  }

  const contentParts = [
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.text }]
    })),
    { role: "user" as const, parts: [{ text: lastUserMessage }] },
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