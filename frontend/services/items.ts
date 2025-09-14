// services/items.ts
import { Platform } from "react-native";

const backendUrl = "https://8c13de897f19.ngrok-free.app"; // same as recipes

export const API_BASE = `${backendUrl}/items`;

export interface Item {
  id: number;
  name: string;
  date_bought: string;
  estimated_expiration?: string | null;
  price: number;
  storage_location: string;
  user_uuid: string;
}

export async function getItems(user_uuid: string): Promise<Item[]> {
  const res = await fetch(`${API_BASE}/get-items?user_uuid=${user_uuid}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch items: ${res.status} ${err}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error("Expected an array but got:", data);
    throw new Error("Invalid items response from server");
  }
  return data;
}

export async function finalizeItems(payload: {
  user_uuid: string;
  items_json: Record<string, any>;
}) {
  const res = await fetch(`${API_BASE}/finalize-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to finalize items: ${res.status} ${err}`);
  }
  return res.json();
}
