const backendUrl = "https://d647843159d4.ngrok-free.app"; // replace with your backend

export const createProfile = async (id: string, username: string, avatar?: string) => {
  try {
    const response = await fetch(`${backendUrl}/user/create_profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        username,
        avatar: avatar || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error creating profile:", error);
    throw error;
  }
};
