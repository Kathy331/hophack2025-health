import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { saveRecipeToSupabase, deleteRecipeFromSupabase } from '../../../services/userService';
import { supabase } from '../../../supabaseClient';

const backendUrl = "https://6c266bbd85cb.ngrok-free.app";

interface Recipe {
  id?: number;  // recipe_id from database
  title: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  servings: number;
  difficulty: string;
  url?: string;  // URL of the video source
}

interface ApiResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
  transcript?: string;
}

export default function AddRecipeScreen() {
  const [videoUrl, setVideoUrl] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Manual input state
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualRecipe, setManualRecipe] = useState<Recipe>({
    title: '',
    ingredients: [''],
    steps: [''],
    cookTime: '',
    servings: 1,
    difficulty: '',
  });

  const validateVideoUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^https?:\/\/(www\.)?instagram\.com\/(reel|p)\/.+/,
      /^https?:\/\/(www\.)?tiktok\.com\/@.+\/video\/.+/,
      /^https?:\/\/(vm\.)?tiktok\.com\/.+/,
    ];
    return patterns.some((pattern) => pattern.test(url));
  };

  const getPlatform = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    return 'Unknown';
  };
  const handleBookmark = async () => {
    // Get the current user from supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !recipe) {
      Alert.alert("You must be logged in to save recipes.");
      return;
    }
    try {
      if (!isBookmarked) {
        const result = await saveRecipeToSupabase(recipe, user.id);
        if (result.success) {
          setIsBookmarked(true);
          setStatusMessage("Recipe saved!");
        }
      } else {
        const result = await deleteRecipeFromSupabase(recipe, user.id);
        if (result.success) {
          setIsBookmarked(false);
          setStatusMessage("Recipe removed from saved!");
        }
      }
    } catch (error: any) {
      if (!error.message?.includes('success')) {  // Only show error if it's not a success message
        Alert.alert("Error", error.message || "Failed to update bookmark.");
      }
    }
  };

  const generateRecipe = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Oops!', 'Please enter a video URL');
      return;
    }
    if (!validateVideoUrl(videoUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid YouTube, Instagram, or TikTok video link.');
      return;
    }

    setLoading(true);
    setRecipe(null);
    setStatusMessage(null);
    setTranscript(null);

    try {
      const response = await fetch(`${backendUrl}/gem/generate-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, platform: getPlatform(videoUrl) }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.recipe) {
        const recipeObj =
          (data.recipe && typeof data.recipe === 'object' && 'recipe' in data.recipe && typeof (data.recipe as any).recipe === 'object')
            ? (data.recipe as any).recipe
            : data.recipe;
        setRecipe({
          ...recipeObj,
          url: videoUrl  // Include the video URL in the recipe
        });
        setStatusMessage('✅ Recipe generated successfully!');
        setTranscript(data.transcript || null);
      } else {
        setStatusMessage(data.error ? `⚠️ ${data.error}` : 'Failed to generate recipe.');
        setTranscript(data.transcript || null);
        setRecipe({ title: '', ingredients: [], steps: [], cookTime: '', servings: 0, difficulty: '' });
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      setStatusMessage('⚠️ Demo mode — showing sample recipe!');
      setRecipe({
        title: "Chocolate Chip Cookies",
        ingredients: [
          "2¼ cups all-purpose flour",
          "1 cup butter, softened",
          "¾ cup granulated sugar",
          "¾ cup brown sugar",
          "2 large eggs",
          "2 tsp vanilla extract",
          "1 tsp baking soda",
          "1 tsp salt",
          "2 cups chocolate chips"
        ],
        steps: [
          "Preheat oven to 375°F (190°C)",
          "Mix butter and sugars until creamy",
          "Beat in eggs and vanilla",
          "Combine flour, baking soda, and salt in separate bowl",
          "Gradually add dry ingredients to wet mixture",
          "Stir in chocolate chips",
          "Drop rounded tablespoons onto ungreased baking sheets",
          "Bake 9-11 minutes until golden brown",
          "Cool on baking sheet for 2 minutes, then transfer to wire rack"
        ],
        cookTime: "25 minutes",
        servings: 24,
        difficulty: "Easy"
      });
    } finally {
      setLoading(false);
    }
  };

  const openVideoUrl = () => {
    if (videoUrl && validateVideoUrl(videoUrl)) Linking.openURL(videoUrl);
  };

  // Manual input handlers
  const handleManualChange = (field: keyof Recipe, value: any) => {
    setManualRecipe({ ...manualRecipe, [field]: value });
  };

  const handleManualIngredientChange = (idx: number, value: string) => {
    const newIngredients = [...manualRecipe.ingredients];
    newIngredients[idx] = value;
    setManualRecipe({ ...manualRecipe, ingredients: newIngredients });
  };

  const handleManualStepChange = (idx: number, value: string) => {
    const newSteps = [...manualRecipe.steps];
    newSteps[idx] = value;
    setManualRecipe({ ...manualRecipe, steps: newSteps });
  };

  const addManualIngredient = () => {
    setManualRecipe({ ...manualRecipe, ingredients: [...manualRecipe.ingredients, ''] });
  };

  const addManualStep = () => {
    setManualRecipe({ ...manualRecipe, steps: [...manualRecipe.steps, ''] });
  };

  const submitManualRecipe = () => {
    if (!manualRecipe.title.trim()) {
      Alert.alert('Please enter a recipe title.');
      return;
    }
    if (manualRecipe.ingredients.length === 0 || manualRecipe.ingredients.some(i => !i.trim())) {
      Alert.alert('Please enter at least one ingredient.');
      return;
    }
    if (manualRecipe.steps.length === 0 || manualRecipe.steps.some(s => !s.trim())) {
      Alert.alert('Please enter at least one step.');
      return;
    }
    setRecipe(manualRecipe);
    setStatusMessage('✅ Manual recipe added!');
    setShowManualInput(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Video to Recipe</Text>
        <Text style={styles.subtitle}>Turn cooking videos into easy-to-follow recipes</Text>
      </View>

      {/* Manual Input Button */}
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setShowManualInput(!showManualInput)}
        >
          <Text style={styles.secondaryButtonText}>
            {showManualInput ? 'Cancel Manual Input' : '➕ Add Recipe Manually'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Input Form */}
      {showManualInput && (
        <View style={styles.manualInputSection}>
          <Text style={styles.sectionTitle}>Manual Recipe Entry</Text>
          <TextInput
            style={styles.input}
            value={manualRecipe.title}
            onChangeText={text => handleManualChange('title', text)}
            placeholder="Recipe Title"
          />
          <TextInput
            style={styles.input}
            value={manualRecipe.cookTime}
            onChangeText={text => handleManualChange('cookTime', text)}
            placeholder="Cook Time (e.g. 30 minutes)"
          />
          <TextInput
            style={styles.input}
            value={manualRecipe.difficulty}
            onChangeText={text => handleManualChange('difficulty', text)}
            placeholder="Difficulty (Easy/Medium/Hard)"
          />
          <TextInput
            style={styles.input}
            value={manualRecipe.servings.toString()}
            onChangeText={text => handleManualChange('servings', parseInt(text) || 1)}
            placeholder="Servings"
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {manualRecipe.ingredients.map((ingredient, idx) => (
            <TextInput
              key={idx}
              style={styles.input}
              value={ingredient}
              onChangeText={text => handleManualIngredientChange(idx, text)}
              placeholder={`Ingredient ${idx + 1}`}
            />
          ))}
          <TouchableOpacity style={styles.addFieldButton} onPress={addManualIngredient}>
            <Text style={styles.addFieldButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Steps</Text>
          {manualRecipe.steps.map((step, idx) => (
            <TextInput
              key={idx}
              style={styles.input}
              value={step}
              onChangeText={text => handleManualStepChange(idx, text)}
              placeholder={`Step ${idx + 1}`}
            />
          ))}
          <TouchableOpacity style={styles.addFieldButton} onPress={addManualStep}>
            <Text style={styles.addFieldButtonText}>+ Add Step</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { marginTop: 10 }]}
            onPress={submitManualRecipe}
          >
            <Text style={styles.buttonText}>Save Recipe</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Video URL Section */}
      {!showManualInput && (
        <View style={styles.inputSection}>
          <Text style={styles.label}>Paste Video URL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://youtube.com/watch?v=..."
              placeholderTextColor="#6b8f71"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
            {videoUrl ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setVideoUrl('');
                  setRecipe(null);
                  setStatusMessage(null);
                  setTranscript(null);
                  setIsBookmarked(false);
                }}
              >
                <MaterialIcons name="close" size={24} color="#52b788" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={generateRecipe}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate</Text>}
            </TouchableOpacity>

            {videoUrl && validateVideoUrl(videoUrl) && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={openVideoUrl}
              >
                <Text style={styles.secondaryButtonText}>Open Video</Text>
              </TouchableOpacity>
            )}
          </View>

          {videoUrl && validateVideoUrl(videoUrl) && (
            <Text style={styles.platformText}>Platform detected: {getPlatform(videoUrl)}</Text>
          )}
        </View>
      )}

      {statusMessage && <Text style={styles.statusText}>{statusMessage}</Text>}

      {transcript && (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptTitle}>Transcript</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}

      {recipe && (
        <View style={styles.recipeSection}>
          {/* Bookmark icon in top right */}
          <TouchableOpacity
            style={styles.bookmarkIcon}
            onPress={handleBookmark}
            accessibilityLabel={isBookmarked ? "Remove bookmark" : "Bookmark recipe"}
          >
            <MaterialIcons
              name={isBookmarked ? "bookmark" : "bookmark-border"}
              size={32}
              color={isBookmarked ? "#52b788" : "#b7b7b7"}
            />
          </TouchableOpacity>
          <Text style={styles.recipeTitle}>{recipe.title || 'Unnamed Recipe'}</Text>
          <View style={styles.recipeMetrics}>
            <Text style={styles.metric}>⏱️ {recipe.cookTime}</Text>
            <Text style={styles.metric}>🍽️ {recipe.servings} servings</Text>
            <Text style={styles.metric}>📊 {recipe.difficulty}</Text>
          </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, idx) => (
                <Text key={idx} style={styles.ingredient}>• {ingredient}</Text>
              ))
            ) : (
              <Text style={styles.ingredient}>No ingredients found.</Text>
            )}

          <Text style={styles.sectionTitle}>Steps</Text>
          {Array.isArray(recipe.steps) && recipe.steps.length > 0 ? (
            recipe.steps.map((step, idx) => (
              <View key={idx} style={styles.step}>
                <Text style={styles.stepNumber}>{idx + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.ingredient}>No instructions found.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  container: { flex: 1, backgroundColor: '#e9f5ec' }, // soft green background
  header: { padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1b4332' },
  subtitle: { fontSize: 16, color: '#2d6a4f', marginTop: 4 },
  inputSection: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#1b4332', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#95d5b2', padding: 15, fontSize: 16, minHeight: 40, marginBottom: 8 },
  buttonRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryButton: { backgroundColor: '#52b788' },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#52b788' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButtonText: { color: '#52b788', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 20 },
  platformText: { marginTop: 8, textAlign: 'center', color: '#40916c' },
  statusText: { textAlign: 'center', marginVertical: 10, fontWeight: '600', color: '#1b4332' },
  transcriptBox: { backgroundColor: '#d8f3dc', margin: 10, padding: 10, borderRadius: 12 },
  transcriptTitle: { fontWeight: 'bold', marginBottom: 5, color: '#1b4332' },
  transcriptText: { fontSize: 13, color: '#081c15' },
  recipeSection: { backgroundColor: '#fff', margin: 10, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 5,
    position: 'relative',},
  recipeTitle: { fontSize: 24, fontWeight: 'bold', color: '#1b4332', marginBottom: 12 },
  recipeMetrics: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#d8f3dc', borderRadius: 10, padding: 12, marginBottom: 20 },
  metric: { fontSize: 14, color: '#40916c', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2d6a4f', marginTop: 15, marginBottom: 8 },
  ingredient: { fontSize: 16, color: '#081c15', marginBottom: 6 },
  step: { flexDirection: 'row', marginBottom: 12 },
  stepNumber: { width: 30, height: 30, backgroundColor: '#52b788', color: '#fff', textAlign: 'center', lineHeight: 30, borderRadius: 15, fontWeight: 'bold', marginRight: 10 },
  stepText: { flex: 1, fontSize: 16, color: '#1b4332' },
  manualInputSection: { backgroundColor: '#f0fff4', margin: 15, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 },
  addFieldButton: { backgroundColor: '#d8f3dc', borderRadius: 8, padding: 10, alignItems: 'center', marginVertical: 6 },
  addFieldButtonText: { color: '#40916c', fontWeight: 'bold' },
  bookmarkIcon: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
});