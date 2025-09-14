import { fetchFoodData } from "../supabaseClient";

// Function to calculate weekly and lifetime food savings
export async function getFoodStats() {
  const data = await fetchFoodData();

  if (!data) return { weekly: 0, lifetime: 0 };

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  let weekly = 0;
  let lifetime = 0;

  data.forEach((item) => {
    const timestamp = new Date(item.timestamp);
    lifetime += item.amount; // Assuming `amount` is the field for food saved

    if (timestamp >= oneWeekAgo) {
      weekly += item.amount;
    }
  });

  return { weekly, lifetime };
}