import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRecipeRecommendations } from '../../../services/recommendationsService';
import { Recipe } from '../../../types';

export default function RecipeRecommendations() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await getRecipeRecommendations();
      setRecipes(response);
    } catch (err) {
      setError('Failed to load recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2C6E49" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadRecipes} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Recipe Recommendations</Text>
      <ScrollView style={styles.scrollView}>
        {recipes.map((recipe, index) => (
          <View key={index} style={styles.recipeCard}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDetail}>Time: {recipe.cook_time}</Text>
            <Text style={styles.recipeDetail}>Difficulty: {recipe.difficulty}</Text>
            <Text style={styles.subHeader}>Ingredients:</Text>
            {recipe.ingredients.map((ing, i) => (
              <Text key={i} style={styles.ingredient}>• {ing}</Text>
            ))}
            <Text style={styles.subHeader}>Steps:</Text>
            {recipe.steps.map((step, i) => (
              <Text key={i} style={styles.step}>{step}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8E6',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C6E49',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C6E49',
    marginBottom: 8,
  },
  recipeDetail: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C6E49',
    marginTop: 12,
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 16,
    color: '#4a4a4a',
    marginLeft: 8,
    marginBottom: 4,
  },
  step: {
    fontSize: 16,
    color: '#4a4a4a',
    marginLeft: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2C6E49',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});