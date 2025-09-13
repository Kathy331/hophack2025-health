import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, StatusBar } from "react-native";
import { supabase } from "../../supabaseClient";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      router.replace("/(tabs)/(home)"); // only redirect after successful login
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.title}>Log In</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Log In" color="#007AFF" onPress={handleLogin} />
      <Button title="Need an account? Sign Up" onPress={() => router.push("/(auth)/signup")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#007AFF", marginBottom: 32, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#007AFF", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, color: "#000" },
  error: { color: "red", marginBottom: 16, textAlign: "center" },
});
