import { useState, useEffect, useCallback } from 'react';

import { 
  View, 
  Text, 
  FlatList, 
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
import { fetchUserRecipes, Recipe, saveRecipeToSupabase, deleteRecipeFromSupabase } from '../../../services/recipeService';

function SavedRecipesScreen({ userId }: { userId: string }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
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


  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        setSelectedRecipe(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metric}>⏱️ {item.cook_time}</Text>
        <Text style={styles.metric}>🍽️ {item.servings} servings</Text>
        <Text style={styles.metric}>📊 {item.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleShare = async () => {
    if (!selectedRecipe) return;

    const recipeText = `
${selectedRecipe.title}

Ingredients:
${selectedRecipe.ingredients?.join('\n') || 'No ingredients listed'}

Steps:
${selectedRecipe.steps?.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'No steps listed'}

${selectedRecipe.url ? `YouTube Link: ${selectedRecipe.url}` : ''}
    `;

    try {
      await Share.share({
        message: recipeText,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const openYoutubeLink = () => {
    if (selectedRecipe?.url) {
      Linking.openURL(selectedRecipe.url).catch(err => console.error('Failed to open URL:', err));
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

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              <ScrollView style={{ width: '100%', marginBottom: 20 }}>
                <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                    selectedRecipe.ingredients.map((ing, idx) => (
                      <Text key={idx} style={styles.itemText}>• {ing}</Text>
                    ))
                  ) : (
                    <Text style={styles.itemText}>No ingredients listed</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Steps</Text>
                  {selectedRecipe.steps && selectedRecipe.steps.length > 0 ? (
                    selectedRecipe.steps.map((step, idx) => (
                      <Text key={idx} style={styles.itemText}>{idx + 1}. {step}</Text>
                    ))
                  ) : (
                    <Text style={styles.itemText}>No steps listed</Text>
                  )}
                </View>

                {selectedRecipe.url && (
                  <TouchableOpacity onPress={openYoutubeLink}>
                    <Text style={styles.youtubeLink}>🎥 Watch on YouTube</Text>
                  </TouchableOpacity>
                )}

              </ScrollView>

              {/* Buttons near the bottom */}
              <View style={styles.modalBottom}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
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
        </Modal>
      )}
    </View>

  );
}

const styles = StyleSheet.create({
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
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  closeButtonFull: {
    backgroundColor: '#52b788',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default SavedRecipesScreen;
