import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../supabaseClient';
import { useRouter } from 'expo-router';

export default function ProfileSettingsUI() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser(); // await here!
      if (!user) throw new Error('No user logged in');

      setEmail(user.email || '');

      // Fetch username from your profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUsername(profileData.username);
    } catch (error: any) {
      console.log('Fetch user error:', error.message);
    }
  };

  fetchUser();
}, []);


  const handleSaveChanges = async () => {
  setLoading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser(); // v2 syntax
    if (!user) throw new Error('No logged-in user');

    const userId = user.id;

    // Update username in profiles table
    const { error: usernameError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', userId);
    if (usernameError) throw usernameError;

    // Update password if provided
    if (password) {
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) throw passwordError;
    }

    Alert.alert('Success', 'Profile updated successfully!');
    setPassword('');
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to update profile.');
  } finally {
    setLoading(false);
  }
};


  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      Alert.alert('Logged Out', 'You have been logged out successfully.');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message || 'Failed to log out.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView>
         <Text style={styles.title}>Profile Settings</Text>
      </SafeAreaView>
     

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Your username"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { color: '#827e7e8a' }]}
        placeholder="you@example.com"
        value={email}
        editable={false} // Email cannot be changedg
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.saveButton, loading && { opacity: 0.5 }]}
        onPress={handleSaveChanges}
        disabled={loading}
      >
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
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
