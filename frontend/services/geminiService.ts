const backendUrl = "https://59c7bf52fa8c.ngrok-free.app";


export const sendReceiptToBackend = async (imageUri: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "receipt.jpg",
    } as any);

    const response = await fetch(`${backendUrl}/gem/parse-receipt`, {  // <-- add /gem
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.parsed;
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
