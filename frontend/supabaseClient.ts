// supabaseClient.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
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