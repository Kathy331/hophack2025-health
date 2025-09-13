import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SearchBar from '../../../components/SearchBar';
import { fetchUserRecipes, Recipe } from '../../../services/recipeService';

function SavedRecipesScreen({ userId }: { userId: string }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUserRecipes(userId);
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);



  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.card} onPress={() => {}}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metric}>⏱️ {item.cook_time}</Text>
        <Text style={styles.metric}>🍽️ {item.servings} servings</Text>
        <Text style={styles.metric}>📊 {item.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#52b788" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      {filteredRecipes.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="no-meals" size={48} color="#52b788" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching recipes found' : 'No saved recipes yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5ec',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    padding: 8,
  },
  metric: {
    fontSize: 14,
    color: '#2d6a4f',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
});

export default SavedRecipesScreen;