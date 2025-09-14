import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  ScrollView, 
  Share, 
  Linking 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SearchBar from '../../../components/SearchBar';
import { fetchUserRecipes, deleteRecipeFromSupabase } from '../../../services/recipeService';
import { router } from 'expo-router';

interface Recipe {
  id: number;
  title: string;
  ingredients: string[];
  steps: string[];
  cook_time: string;
  difficulty: string;
  servings: number;
  url?: string;
  user_uuid: string;
}

interface RecipeOptional {
  id?: number;
  title: string;
  ingredients?: string[];
  steps?: string[];
  cook_time: string;
  difficulty: string;
  servings: number;
  url?: string;
  user_uuid?: string;
}

interface SavedRecipesScreenProps {
  userId: string;
}

function SavedRecipesScreen({ userId }: SavedRecipesScreenProps) {
  type RecipeWithOptionals = Omit<Recipe, 'ingredients' | 'steps'> & {
    ingredients?: string[];
    steps?: string[];
  };
  const [recipes, setRecipes] = useState<RecipeWithOptionals[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithOptionals | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleShare = async () => {
    if (!selectedRecipe) return;
    
    try {
      await Share.share({
        message: `Check out this recipe for ${selectedRecipe.title}!\n\n` +
          `Cooking Time: ${selectedRecipe.cook_time}\n` +
          `Difficulty: ${selectedRecipe.difficulty}\n` +
          `Servings: ${selectedRecipe.servings}\n\n` +
          (selectedRecipe.url ? `Video: ${selectedRecipe.url}` : ''),
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const openYoutubeLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const handleDelete = async (recipe: RecipeWithOptionals) => {
    if (!recipe.id) return;
    
    try {
      await deleteRecipeFromSupabase({
        ...recipe,
        id: recipe.id,
        user_uuid: userId,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || []
      }, userId);
      setModalVisible(false);
      loadRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
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
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <ScrollView style={styles.scrollContainer}>
        {filteredRecipes.length === 0 ? (
          <View style={styles.centered}>
            <MaterialIcons name="no-meals" size={48} color="#52b788" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching recipes found' : 'No saved recipes yet'}
            </Text>
          </View>
        ) : (
          filteredRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeItem}
              onPress={() => {
                setSelectedRecipe(recipe);
                setModalVisible(true);
              }}
            >
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metric}>⏱️ {recipe.cook_time}</Text>
                <Text style={styles.metric}>🍽️ {recipe.servings} servings</Text>
                <Text style={styles.metric}>📊 {recipe.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedRecipe && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView style={{ width: '100%', marginBottom: 20 }}>
                <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {selectedRecipe.ingredients?.length ? (
                    selectedRecipe.ingredients.map((ing, idx) => (
                      <Text key={idx} style={styles.itemText}>• {ing}</Text>
                    ))
                  ) : (
                    <Text style={styles.itemText}>No ingredients listed</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Steps</Text>
                  {selectedRecipe.steps?.length ? (
                    selectedRecipe.steps.map((step, idx) => (
                      <Text key={idx} style={styles.itemText}>{idx + 1}. {step}</Text>
                    ))
                  ) : (
                    <Text style={styles.itemText}>No steps listed</Text>
                  )}
                </View>

                {selectedRecipe.url && (
                  <TouchableOpacity 
                    onPress={() => selectedRecipe.url && openYoutubeLink(selectedRecipe.url)}
                  >
                    <Text style={styles.youtubeLink}>🎥 Watch on YouTube</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <View style={styles.modalBottom}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setModalVisible(false);
                      router.push(`/(tabs)/(recipes)/AddRecipeScreen?recipeId=${selectedRecipe?.id}`);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => selectedRecipe && handleDelete(selectedRecipe)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeButtonFull}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f7f3',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recipeItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C6E49',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metric: {
    color: '#666',
    fontSize: 14,
  },
  list: {
    marginTop: 16,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: '#e63946',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C6E49',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C6E49',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  youtubeLink: {
    color: '#FF0000',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10,
    marginBottom: 20,
  },
  modalBottom: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#83BD75',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  closeButtonFull: {
    backgroundColor: '#52b788',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SavedRecipesScreen;
