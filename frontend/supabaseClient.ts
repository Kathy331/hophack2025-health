// supabaseClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from "@supabase/supabase-js";


// Replace with your project URL and anon key (frontend-safe)
const SUPABASE_URL = "https://mieednbnsgwggdatomst.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZWVkbmJuc2d3Z2dkYXRvbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzUyMjQsImV4cCI6MjA3MzMxMTIyNH0.P7rOpyDAo_b35_Dy0q3nkDWZ9CvbfTj2-_f8Upo7qCA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // not needed for React Native
    },
  });

// Function to fetch food data from Supabase
export async function fetchFoodData() {
  try {
    const { data, error } = await supabase
      .from("food_data") // Replace with your actual table name
      .select("*, timestamp") // Ensure to include the timestamp column
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching food data:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching food data:", err);
    return null;
  }
}
