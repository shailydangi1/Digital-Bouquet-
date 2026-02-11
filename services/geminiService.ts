
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export const generateBouquetFromSketches = async (
  sketches: string[], // base64 data URLs
  sender: string,
  recipient: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = sketches.map(dataUrl => {
    const base64Data = dataUrl.split(',')[1];
    return {
      inlineData: {
        data: base64Data,
        mimeType: 'image/png'
      }
    };
  });

  const textPart = {
    text: `URGENT ARTISTIC MISSION: Create a single, cohesive, high-end digital bouquet for ${recipient} from ${sender}.
    
    CRITICAL REQUIREMENT: I have provided ${sketches.length} specific hand-drawn sketches. You MUST use the EXACT shapes, color schemes, and "cartoon" characteristics of these drawings. DO NOT replace them with standard realistic flowers. 
    
    The goal is to elevate these sketches into a professional "Realistic and Cartoony" 3D digital art piece. Imagine if a Pixar artist took these exact drawings and rendered them with beautiful lighting, depth, and textures in a single masterpiece.
    
    Composition:
    - Place all drawn flowers into a single beautiful vase or a curated wrap.
    - Style: Professional 3D digital illustration, vibrant, magical.
    - Contrast: Use a dark, elegant background (deep emerald, midnight navy, or charcoal) to make the vibrant hand-drawn colors pop.
    - No text in the image.
    
    Transform these doodles into a luxury digital gift.`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [...imageParts, textPart]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        imageConfig: {
          aspectRatio: "4:5"
        }
      },
    });

    let imageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("No image generated");
    return imageUrl;
  } catch (error) {
    console.error("Error generating bouquet from sketches:", error);
    throw error;
  }
};
