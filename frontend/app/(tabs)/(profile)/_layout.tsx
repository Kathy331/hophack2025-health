import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export default function ProfileSettingsUI() {
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#EAF8E6', // soft eco-friendly green
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderColor: '#C5E1A5',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
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
    opacity: 0.5, // visually disabled
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
