const backendUrl = "https://d647843159d4.ngrok-free.app";

export const sendReceiptToBackend = async (imageUri: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "receipt.jpg",
    } as any);

    const response = await fetch(`${backendUrl}/gem/parse-receipt`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server error ${response.status}: ${text}`);
    }

    // This will be { parsed: { items: [...] } }
    const data = await response.json();
    return data.parsed; // parsed JSON with items
  } catch (error) {
    console.error("Error sending receipt to backend:", error);
    throw error;
  }
};

export interface Item {
  name: string;
  date_bought: string;
  price: number;
  estimated_expiration?: string | null;
  storage_location?: string; // optional for frontend edits
}

export interface FinalizeItemsPayload {
  user_uuid: string;
  items_json: { items: Item[] };
}

export const finalizeItems = async (payload: FinalizeItemsPayload) => {
  try {
    const response = await fetch(`${backendUrl}/item/finalize-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data; // e.g., { status: "success", result: ... }
  } catch (error) {
    console.error("Error finalizing items:", error);
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
