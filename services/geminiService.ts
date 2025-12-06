import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is expected to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    emotion: {
      type: Type.STRING,
      description: "The detected emotion of the primary person (e.g., Happy, Angry, Neutral, Surprised). If no person, 'None'.",
    },
    action: {
      type: Type.STRING,
      description: "The current physical action (e.g., Standing, Sitting, Waving, Walking). If no person, 'None'.",
    },
    isPersonDetected: {
      type: Type.BOOLEAN,
      description: "True if a human is clearly visible.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 100.",
    },
    location: {
      type: Type.STRING,
      enum: ['left', 'center', 'right'],
      description: "Approximate horizontal location of the person in the frame.",
    }
  },
  required: ["emotion", "action", "isPersonDetected", "confidence"],
};

export const analyzeFrame = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: "Analyze this video frame. Identify the primary person's emotion and body action.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for consistent classification
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        timestamp: new Date().toLocaleTimeString(),
      };
    } else {
        throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a safe fallback to prevent app crash
    return {
      emotion: "Error",
      action: "Retry...",
      isPersonDetected: false,
      confidence: 0,
      timestamp: new Date().toLocaleTimeString(),
      location: 'center'
    };
  }
};
