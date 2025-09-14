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
import { fetchUserRecipes, Recipe } from '../../../services/recipeService';

function SavedRecipesScreen({ userId }: { userId: string }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);

  const [completedIngredients, setCompletedIngredients] = useState<boolean[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

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

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        setSelectedRecipe(item);
        setModalVisible(true);
        setCookingMode(false);
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

  const activateCookingMode = () => {
    if (!selectedRecipe) return;
    setCookingMode(true);
    setCompletedIngredients(new Array(selectedRecipe.ingredients?.length || 0).fill(false));
    setCompletedSteps(new Array(selectedRecipe.steps?.length || 0).fill(false));
  };

  const toggleIngredient = (index: number) => {
    const updated = [...completedIngredients];
    updated[index] = !updated[index];
    setCompletedIngredients(updated);
  };

  const toggleStep = (index: number) => {
    const updated = [...completedSteps];
    updated[index] = !updated[index];
    setCompletedSteps(updated);
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

      {/* Recipe Modal */}
      {selectedRecipe && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              {/* Close "X" */}
              <TouchableOpacity 
                style={styles.closeIcon} 
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>

              <ScrollView style={{ width: '100%', marginBottom: 20 }}>
                <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>

                {cookingMode && (
                  <Text style={styles.cookingHint}>Tap items to mark as complete ✅</Text>
                )}
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {(selectedRecipe.ingredients || []).map((ing, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      onPress={() => cookingMode && toggleIngredient(idx)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.itemText,
                        cookingMode && completedIngredients[idx] ? styles.completedText : {}
                      ]}>
                        • {ing}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {(!selectedRecipe.ingredients || selectedRecipe.ingredients.length === 0) && (
                    <Text style={styles.itemText}>No ingredients listed</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Steps</Text>
                  {(selectedRecipe.steps || []).map((step, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      onPress={() => cookingMode && toggleStep(idx)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.itemText,
                        cookingMode && completedSteps[idx] ? styles.completedText : {}
                      ]}>
                        {idx + 1}. {step}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {(!selectedRecipe.steps || selectedRecipe.steps.length === 0) && (
                    <Text style={styles.itemText}>No steps listed</Text>
                  )}
                </View>

                {selectedRecipe.url && (
                  <TouchableOpacity onPress={openYoutubeLink}>
                    <Text style={styles.youtubeLink}>🎥 Watch on YouTube</Text>
                  </TouchableOpacity>
                )}

              </ScrollView>

              {/* Buttons */}
              <View style={styles.modalBottom}>
                {!cookingMode ? (
                  <>
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

                    <TouchableOpacity style={styles.closeButtonFull} onPress={activateCookingMode}>
                      <Text style={styles.closeButtonText}>Activate</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.closeButtonFull} onPress={() => setCookingMode(false)}>
                    <Text style={styles.closeButtonText}>Finish Cooking</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e9f5ec' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
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
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1b4332', marginBottom: 8 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f0fff4', borderRadius: 8, padding: 8 },
  metric: { fontSize: 14, color: '#2d6a4f' },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 },
  errorText: { fontSize: 16, color: '#dc2626', textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    zIndex: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#1b4332', textAlign: 'center' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#1b4332' },
  itemText: { fontSize: 15, color: '#2d6a4f', marginBottom: 6, lineHeight: 22 },
  completedText: { 
    textDecorationLine: 'line-through', 
    color: '#32CD32'  // greenish color for crossed items
  },
  youtubeLink: { fontSize: 16, color: '#1d4ed8', textDecorationLine: 'underline', marginBottom: 12 },
  cookingHint: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 10 },

  modalBottom: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
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
