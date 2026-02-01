import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function Config
export const config = {
  maxDuration: 60, // Allow up to 60 seconds for execution
  api: {
    bodyParser: {
      sizeLimit: '4.5mb', // Strict limit for Vercel functions
    },
  },
};

// Standard Node.js handler for Vercel
export default async function handler(req: any, res: any) {
  // CORS Handling
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // req.body is automatically parsed by Vercel if Content-Type is application/json
    const { image, mimeType, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: 'Missing image or prompt' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is not set in server environment.");
      return res.status(500).json({ error: 'Server configuration error: API_KEY missing' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // UPDATED PROMPT: Generate Younger Self
    const fullPrompt = `
      Instructions:
      1. Analyze the attached image of the adult person.
      2. Generate a new photorealistic image of this SAME person but as a child (approximately 6-8 years old).
      3. Place them in the following scenario/memory: "${prompt}".
      4. Ensure the face maintains recognizable features of the original person (eye color, face shape) but adapted to be a cute, healthy child.
      5. The style should be nostalgic, warm, and high-quality photography.
      6. Do not generate a cartoon. Keep it photorealistic.
      7. Ensure the setting matches the description provided.
    `;

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: image,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
    });

    // Parse Response
    const parts = response.candidates?.[0]?.content?.parts;
    let imageUrl = null;
    let textResponse = null;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageUrl) {
        // Fallback: If model refused to generate image, return the text explanation
        const errorMessage = textResponse || "The AI could not generate an image for this prompt. Please try a different description.";
        console.warn("Model output text instead of image:", errorMessage);
        return res.status(422).json({ error: errorMessage });
    }

    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}