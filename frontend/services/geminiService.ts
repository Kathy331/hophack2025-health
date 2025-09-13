// geminiService.ts
const backendUrl = "https://d0031cc660ac.ngrok-free.app";

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
