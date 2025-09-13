import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions 
} from 'react-native';
import Slider from '@react-native-community/slider';
import { searchRecipes, Recipe } from '../../../services/userService';

const { width } = Dimensions.get('window');

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function SavedRecipesScreen({ userId }: { userId: string }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [minServings, setMinServings] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const results = await searchRecipes({
        userId,
        searchQuery,
        difficulty,
        minServings,
      });
      setRecipes(results);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, difficulty, minServings]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Saved Recipes</Text>

      <TextInput
        placeholder="Search recipes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
        placeholderTextColor="#000"
      />

      <View style={styles.filterRow}>
        {difficulties.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              difficulty === level && styles.filterButtonActive,
            ]}
            onPress={() => setDifficulty(level as any)}
          >
            <Text
              style={[
                styles.filterText,
                difficulty === level && styles.filterTextActive,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Minimum Servings: {minServings}</Text>
        <Slider
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={minServings}
          onValueChange={setMinServings}
          minimumTrackTintColor="#34c759"
          maximumTrackTintColor="#a8e6a3"
          thumbTintColor="#1a531b"
        />
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading recipes...</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeDetails}>
                {item.difficulty} | {item.servings} servings
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf8ea',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a531b',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#c8e6c9',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1a531b',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#34c759',
  },
  filterButtonActive: {
    backgroundColor: '#34c759',
  },
  filterText: {
    color: '#1a531b',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    color: '#1a531b',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a531b',
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 14,
    color: '#4d784e',
  },
  loadingText: {
    textAlign: 'center',
    color: '#1a531b',
    marginTop: 20,
  },
});
