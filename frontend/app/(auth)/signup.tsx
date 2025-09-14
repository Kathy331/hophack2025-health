import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, StatusBar } from "react-native";
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

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !signInData.user) {
      setError(signInError?.message || "Failed to sign in after signup");
      return;
    }

    try {
      await createProfile(signInData.user.id, username);
      router.replace("/(tabs)/(home)");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eaf8ea" />
      <Text style={styles.title}>🌱 Sign Up For Gobble</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#25242477" 
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#25242477" 
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        placeholderTextColor="#25242477" 
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.loginText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf8ea", // soft green background
    justifyContent: "center",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a531b",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#34c759",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#1a531b",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  
  },
  error: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  signupButton: {
    backgroundColor: "#34c759",
    paddingVertical: 15,
    borderRadius: 30,
    width: "100%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  loginText: {
    color: "#1a531b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    textDecorationLine: "underline",
 

  }, 
});
