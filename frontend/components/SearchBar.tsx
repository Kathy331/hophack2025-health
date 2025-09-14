import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search recipes...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={24} color="#52b788" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b8f71"
      />
      {value !== '' && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <MaterialIcons name="close" size={24} color="#52b788" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    margin: 15,
    marginTop: 5,
    borderWidth: 2,
    borderColor: '#95d5b2',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1b4332',
  },
});