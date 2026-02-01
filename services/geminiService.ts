/**
 * Generates a future retirement image by calling the secure server-side API.
 * This ensures the API key remains hidden from the client browser.
 * 
 * @param base64Image The base64 encoded string of the user's current photo.
 * @param mimeType The mime type of the image (e.g., 'image/jpeg').
 * @param userPrompt The user's description of their dream retirement.
 * @returns The base64 data URI of the generated image.
 */
export const generateFutureSelf = async (
  base64Image: string,
  mimeType: string,
  userPrompt: string
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        mimeType,
        prompt: userPrompt,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error("API endpoint not found. If you are running locally, Vercel Serverless Functions do not run in 'npm run dev'. You must deploy to Vercel to test generating images.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error("No image URL received from server");
    }

    return data.imageUrl;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Generation Service Error:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The image generation took too long.");
    }
    
    throw error;
  }
};