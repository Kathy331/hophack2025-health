import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SearchBar from '../../../components/SearchBar';
import { fetchUserRecipes, Recipe, saveRecipeToSupabase, deleteRecipeFromSupabase } from '../../../services/recipeService';

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

  const handleDelete = async (recipe: Recipe) => {
    try {
      const result = await deleteRecipeFromSupabase(recipe, userId);
      if (result.success) {
        setRecipes((prevRecipes) => prevRecipes.filter((r) => r.id !== recipe.id));
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

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
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      {filteredRecipes.length === 0 ? (
        <View style={styles.centered}>
          <MaterialIcons name="no-meals" size={48} color="#52b788" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching recipes found' : 'No saved recipes yet'}
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {filteredRecipes.map((item) => (
            <View key={item.id} style={styles.recipeItem}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: '#e9f5ec',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
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
  recipeItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SavedRecipesScreen;
