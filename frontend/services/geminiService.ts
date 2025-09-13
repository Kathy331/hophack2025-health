const backendUrl = "https://501ff1f547e0.ngrok-free.app";

export const sendReceiptToBackend = async (imageUri: string, userId: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "receipt.jpg",
    } as any);

    // Pass the logged-in user's UUID
    formData.append("user_uuid", userId);

    const response = await fetch(`${backendUrl}/gem/parse-receipt`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data.parsed;
  } catch (error) {
    console.error("Error sending receipt to backend:", error);
    throw error;
  }
};

// analyzeImageWithGemini remains unchanged


export const analyzeImageWithGemini = async (imageUri: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "food.jpg",
    } as any);

    const response = await fetch(`${backendUrl}/gem/analyze-image`, {  // <-- add /gem
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error("Error sending image to backend:", error);
    throw error;
  }
};
