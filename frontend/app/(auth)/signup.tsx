import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, StatusBar } from "react-native";
import { supabase } from "../../supabaseClient";
import { useRouter } from "expo-router";
import { createProfile } from "../../services/userService";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Sign in immediately after signup
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !signInData.user) {
      setError(signInError?.message || "Failed to sign in after signup");
      return;
    }

    // Create profile in DB (optional)
    try {
      await createProfile(signInData.user.id, username);
      router.replace("/(tabs)/(home)"); // only redirect after successful signup/login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.title}>Sign Up</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Sign Up" color="#007AFF" onPress={handleSignup} />
      <Button title="Already have an account? Log In" onPress={() => router.push("/(auth)/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#007AFF", marginBottom: 32, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#007AFF", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, color: "#000" },
  error: { color: "red", marginBottom: 16, textAlign: "center" },
});
