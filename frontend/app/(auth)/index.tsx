import { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, StatusBar } from "react-native";
import { supabase } from "../../supabaseClient";
import { useRouter } from "expo-router";
import { createProfile } from "../../services/userService";

export default function AuthIndex() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      try {
        await createProfile(data.user.id, username);
        router.replace("/(tabs)/(home)" as const);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.title}>Sign Up</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Sign Up" color="#007AFF" onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#007AFF", marginBottom: 32, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#007AFF", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, color: "#000" },
  error: { color: "red", marginBottom: 16, textAlign: "center" },
});
