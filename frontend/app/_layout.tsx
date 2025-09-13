// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import React, { useEffect, useState } from "react";

import { useColorScheme } from "../hooks/use-color-scheme";
import { supabase } from "../supabaseClient";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
  
      if (data.session?.user) {
        // Optionally verify user exists in your DB
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();
  
        if (!profile) {
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(data.session);
        }
      } else {
        setSession(null);
      }
  
      setAuthChecked(true);
    };
  
    checkSession();
  
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession?.user ? newSession : null);
    });
  
    return () => listener.subscription.unsubscribe();
  }, []);
  
  if (!loaded || !authChecked) return null; // splash screen

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          // User not logged in → show auth stack
          <Stack.Screen name="(auth)" />
        ) : (
          // User logged in → show tabs
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
