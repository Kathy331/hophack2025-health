import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export default function RecipeRecommendations() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recipe Recommendations</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8E6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#2C6E49',
    textAlign: 'center',
    marginTop: 20,
  },
});