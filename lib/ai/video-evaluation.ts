import { GoogleGenAI } from "@google/genai";
import { EvaluationResult, Message } from '../../types/index';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const EVALUATION_SYSTEM_INSTRUCTION = `
You are an expert technical interviewer evaluating a software engineering candidate.
You have access to:
1. A video recording of their work session (which may include audio commentary from the candidate).
2. The full chat transcript between the candidate and their AI coworkers.

Your task is to analyze this evidence and score the candidate on 8 specific dimensions.

## 8 EVALUATION DIMENSIONS

1. COMMUNICATION: Clarity of expression, quality of questions, conciseness. (Listen to audio if available).
2. PROBLEM_SOLVING: Systematic breakdown, hypothesis testing, handling blockers.
3. TECHNICAL_KNOWLEDGE: Tool mastery, best practices, resourcefulness.
4. COLLABORATION: Reaching out appropriately, receptiveness to feedback.
5. ADAPTABILITY: Responding to changing requirements, recovering from errors.
6. LEADERSHIP: Ownership, initiative, decision making.
7. CREATIVITY: Novel solutions, exploring multiple approaches.
8. TIME_MANAGEMENT: Prioritization, pacing, balancing speed vs quality.

## SCORING RULES
- Score each dimension from 1 (Insufficient) to 5 (Exceptional).
- If insufficient evidence for a dimension, use null.
- **CRITICAL**: You MUST cite specific timestamps or chat messages as evidence.
- If analyzing video, look for coding patterns, speed, use of documentation, and debugging flow.

## HIRING RECOMMENDATION
- HIRE: Strong competence, green flags outweigh red.
- MAYBE: Mixed signals, needs probe.
- NO_HIRE: Significant concerns.

## OUTPUT FORMAT
Return a valid JSON object matching the EvaluationResult interface.
Structure:
{
  "overallScore": number (1.0-5.0),
  "dimensionScores": {
    "COMMUNICATION": { "score": number, "rationale": string, "greenFlags": string[], "redFlags": string[], "timestamps": string[], "trainableGap": boolean },
    ...
  },
  "overallGreenFlags": string[],
  "overallRedFlags": string[],
  "recommendation": "hire" | "maybe" | "no_hire",
  "recommendationRationale": string,
  "overallSummary": string,
  "keyHighlights": [ { "timestamp": "MM:SS", "type": "positive"|"negative", "dimension": string, "description": string, "quote": string|null } ],
  "confidence": "high" | "medium" | "low"
}
`;

export async function evaluateSession(
  screenshots: Blob[],
  chatHistory: Message[],
  videoBlob: Blob | null = null
): Promise<EvaluationResult> {
  const API_KEY = process.env.API_KEY || '';
  
  // Fallback to mock if no API key or no evidence
  if (!API_KEY || (screenshots.length === 0 && !videoBlob && chatHistory.length === 0)) {
    console.warn("No API Key or evidence found, using mock evaluation.");
    return simulateVideoEvaluation();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Prepare Chat Transcript
    const transcript = chatHistory
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.senderName}: ${m.text}`)
      .join('\n');

    let contentParts: any[] = [];

    // PRIORITIZE VIDEO BLOB IF AVAILABLE
    if (videoBlob && videoBlob.size > 0) {
      console.log(`Evaluating using full video blob. Size: ${videoBlob.size}, Type: ${videoBlob.type}`);
      const base64Video = await blobToBase64(videoBlob);
      contentParts.push({
        inlineData: {
          mimeType: videoBlob.type || "video/webm", // Use actual blob type
          data: base64Video
        }
      });
    } else {
      // FALLBACK TO SCREENSHOTS
      const step = Math.ceil(screenshots.length / 15);
      const selectedScreenshots = screenshots.filter((_, i) => i % step === 0);

      const imageParts = await Promise.all(
        selectedScreenshots.map(async (blob) => ({
          inlineData: {
            mimeType: blob.type,
            data: await blobToBase64(blob)
          }
        }))
      );
      contentParts = [...contentParts, ...imageParts];
    }

    contentParts.push({ 
      text: `Here is the chat transcript of the session:\n\n${transcript}\n\nPlease evaluate the candidate based on the visual/audio evidence and this conversation.` 
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: {
        role: "user",
        parts: contentParts
      },
      config: {
        systemInstruction: EVALUATION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Add default values if AI misses some fields
    const result = JSON.parse(cleanedText);
    return {
      ...result,
      overallGreenFlags: result.overallGreenFlags || [],
      overallRedFlags: result.overallRedFlags || [],
      dimensionScores: result.dimensionScores || {},
      keyHighlights: result.keyHighlights || []
    };

  } catch (error) {
    console.error("Evaluation Failed:", error);
    throw new Error("Failed to generate evaluation");
  }
}

// Fallback Mock data
const MOCK_RESULT: EvaluationResult = {
  overallScore: 4.2,
  confidence: 'high',
  recommendation: 'hire',
  recommendationRationale: "The candidate demonstrated strong technical proficiency and excellent communication skills. They clarified requirements early, used the Redis wrapper correctly after checking documentation, and handled the manager's feedback during the code review with maturity. Minor deductions for initially missing the unit test requirement.",
  overallGreenFlags: [
    "Proactively clarified ambiguity around the sliding window algorithm",
    "Correctly identified and used existing project abstractions (Redis wrapper)",
    "Strong ownership during the PR defense call"
  ],
  overallRedFlags: [
    "Initial implementation lacked comprehensive error handling",
    "Spent slightly too long debugging a simple syntax error"
  ],
  overallSummary: "A strong performance indicating a Senior-level capability. The candidate moved efficiently through the task, demonstrated good instincts by checking the codebase for existing patterns before writing new code, and communicated clearly with the AI manager.",
  keyHighlights: [
    {
      timestamp: "02:15",
      type: "positive",
      dimension: "COMMUNICATION",
      description: "Clearly clarified requirements with Sarah before starting",
      quote: "Just to double check, I should use the dev-token header for local testing?"
    },
    {
      timestamp: "08:30",
      type: "negative",
      dimension: "PROBLEM_SOLVING",
      description: "Got stuck on Redis connection syntax for 5 minutes",
      quote: null
    },
    {
      timestamp: "14:45",
      type: "positive",
      dimension: "TECHNICAL_KNOWLEDGE",
      description: "Implemented efficient sliding window algorithm in Lua",
      quote: null
    },
    {
      timestamp: "28:10",
      type: "positive",
      dimension: "LEADERSHIP",
      description: "Took strong ownership during the PR defense call",
      quote: "I chose this approach to minimize latency at scale."
    }
  ],
  dimensionScores: {
    COMMUNICATION: {
      score: 5,
      rationale: "Excellent clarity in written messages. Asked precise clarifying questions.",
      greenFlags: ["Concise updates", "Professional tone"],
      redFlags: [],
      observableBehaviors: "Sent 3 messages to Sarah, all under 2 sentences but fully clear.",
      timestamps: ["02:15", "05:45"],
      trainableGap: false
    },
    PROBLEM_SOLVING: {
      score: 4,
      rationale: "Good systematic approach. Broke the rate limiter down into key components.",
      greenFlags: ["Logical breakdown", "Good hypothesis testing"],
      redFlags: ["Struggled briefly with Redis syntax"],
      observableBehaviors: "Drafted pseudocode before implementation.",
      timestamps: ["08:20"],
      trainableGap: true
    },
    TECHNICAL_KNOWLEDGE: {
      score: 4,
      rationale: "Strong understanding of Node.js async patterns and Redis basics.",
      greenFlags: ["Used async/await correctly", "Knew Redis expiry patterns"],
      redFlags: [],
      observableBehaviors: "Implemented sliding window correctly.",
      timestamps: ["12:10"],
      trainableGap: false
    },
    COLLABORATION: {
      score: 5,
      rationale: "Leveraged the team effectively. Didn't spin wheels when stuck.",
      greenFlags: ["Asked Sarah about Redis wrapper"],
      redFlags: [],
      observableBehaviors: "Reached out after 5 mins of searching docs.",
      timestamps: ["06:30"],
      trainableGap: false
    },
    ADAPTABILITY: {
      score: 4,
      rationale: "Adjusted well when the manager asked for unit tests.",
      greenFlags: ["Pivoted to testing quickly"],
      redFlags: [],
      observableBehaviors: "Immediately set up Jest after manager prompt.",
      timestamps: ["22:00"],
      trainableGap: false
    },
    LEADERSHIP: {
      score: 3,
      rationale: "Took ownership of the task but didn't propose architectural improvements.",
      greenFlags: ["Owned the delivery"],
      redFlags: [],
      observableBehaviors: "Focused on execution.",
      timestamps: ["00:00"],
      trainableGap: true
    },
    CREATIVITY: {
      score: 4,
      rationale: "Came up with a clever key naming scheme for the rate limiter.",
      greenFlags: ["Unique key namespacing"],
      redFlags: [],
      observableBehaviors: "Used IP + UserAgent hash for keys.",
      timestamps: ["10:15"],
      trainableGap: false
    },
    TIME_MANAGEMENT: {
      score: 5,
      rationale: "Finished within the allocated time with a complete PR.",
      greenFlags: ["Paced well", "Submitted on time"],
      redFlags: [],
      observableBehaviors: "Submitted PR at 28:00 mark.",
      timestamps: ["28:00"],
      trainableGap: false
    }
  }
};

export async function simulateVideoEvaluation(): Promise<EvaluationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_RESULT);
    }, 3500);
  });
}