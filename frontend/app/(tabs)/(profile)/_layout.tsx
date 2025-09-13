import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '../../../supabaseClient'; // adjust path if needed
import { useRouter } from 'expo-router';

export default function ProfileSettingsUI() {
  const router = useRouter(); // Must be inside component

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      Alert.alert('Logged Out', 'You have been logged out successfully.');

      // Navigate to login screen
      router.replace('/login'); // file-system route to login.tsx
    } catch (error: any) {
      Alert.alert('Logout Error', error.message || 'Failed to log out.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>🌱 Profile Settings</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Your username"
        editable={false}
        value="john_doe"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        editable={false}
        value="john@example.com"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry={true}
        editable={false}
        value="password"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Notifications</Text>
        <Switch value={true} disabled={true} trackColor={{ true: '#83BD75' }} />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Private Account</Text>
        <Switch value={false} disabled={true} trackColor={{ false: '#ccc' }} />
      </View>

      <TouchableOpacity style={styles.saveButton} disabled={true}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#EAF8E6',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C6E49',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#2C6E49',
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderColor: '#C5E1A5',
    borderWidth: 1.5,
    fontSize: 16,
    marginBottom: 18,
    color: '#888',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderColor: '#C5E1A5',
    borderWidth: 1,
  },
  switchLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2C6E49',
  },
  saveButton: {
    backgroundColor: '#83BD75',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#E64A19',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
