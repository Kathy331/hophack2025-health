// geminiService.ts
import Constants from 'expo-constants';

const backendUrl = Constants.expoConfig?.extra?.NGROK_FORWARDING || process.env.NGROK_FORWARDING || "http://localhost:3000";

export const sendReceiptToBackend = async (imageUri: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "receipt.jpg",
    } as any); // 'as any' fixes TypeScript issue with FormData

    const response = await fetch(`${backendUrl}/parse-receipt`, {
      method: "POST",
      body: formData,
      // Do NOT set 'Content-Type'; let fetch handle it
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.parsed; // JSON returned by backend
  } catch (error) {
    console.error("Error sending receipt to backend:", error);
    throw error;
  }
};

export const analyzeImageWithGemini = async (imageUri: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "food.jpg",
    } as any);

    const response = await fetch(`${backendUrl}/analyze-image`, {
      method: "POST",
      body: formData,
      // Do NOT set 'Content-Type'; let fetch handle it
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis; // JSON returned by backend
  } catch (error) {
    console.error("Error sending image to backend:", error);
    throw error;
  }
};
