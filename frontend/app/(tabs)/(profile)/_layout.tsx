import React from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function ProfileSettingsUI() {
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Profile Settings</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Your username"
        editable={false}  // Non-editable for purely visual purpose
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
        <Switch value={true} disabled={true} />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Private Account</Text>
        <Switch value={false} disabled={true} />
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
    backgroundColor: '#f4f6f8',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
  },
  label: {
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderColor: '#ddd',
    borderWidth: 1.5,
    fontSize: 16,
    marginBottom: 20,
    color: '#999', // grayed out to indicate read-only
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  switchLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    opacity: 0.5, // faded since it's disabled
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
