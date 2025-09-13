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
  Linking
} from 'react-native';
const backendUrl = "https://95c506bce95d.ngrok-free.app";

interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  servings: number;
  difficulty: string;
}

interface ApiResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
  transcript?: string;
}

export default function RecipesScreen() {
  const [videoUrl, setVideoUrl] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validate and normalize video URL
  const validateVideoUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^https?:\/\/(www\.)?instagram\.com\/(reel|p)\/.+/,
      /^https?:\/\/(www\.)?tiktok\.com\/@.+\/video\/.+/,
      /^https?:\/\/(vm\.)?tiktok\.com\/.+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  // Extract platform from URL
  const getPlatform = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    return 'Unknown';
  };

  // Main function to process video and generate recipe
  const generateRecipe = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }

    if (!validateVideoUrl(videoUrl)) {
      Alert.alert(
        'Invalid URL', 
        'Please enter a valid YouTube, Instagram, or TikTok video URL'
      );
      return;
    }

  setLoading(true);
  setRecipe(null);
  setStatusMessage(null);
  setTranscript(null);

    try {
      // Call your Python FastAPI backend
  const response = await fetch(`${backendUrl}/gem/generate-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: videoUrl,
          platform: getPlatform(videoUrl)
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.recipe) {
        // Handle both {recipe: {...}} and {...} shapes
        const recipeObj = (data.recipe && typeof data.recipe === 'object' && 'recipe' in data.recipe && typeof (data.recipe as any).recipe === 'object')
          ? (data.recipe as any).recipe
          : data.recipe;
        setRecipe(recipeObj);
        setStatusMessage('Transcript found and recipe generated!');
        setTranscript(data.transcript || null);
        console.log('Transcript found, recipe:', recipeObj);
      } else {
        setStatusMessage(data.error ? `Transcript not found or error: ${data.error}` : 'Failed to generate recipe.');
        setTranscript(data.transcript || null);
        console.log('Transcript error or no recipe:', data.error || data);
        setRecipe({
          title: '',
          ingredients: [],
          steps: [],
          cookTime: '',
          servings: 0,
          difficulty: ''
        });
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      
      // For demo purposes, show a mock recipe
      const mockRecipe: Recipe = {
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
      };
      
  setRecipe(mockRecipe);
  setStatusMessage('Demo Mode: Showing sample recipe. Connect your backend to process real videos!');
  // Alert.alert('Demo Mode', 'Showing sample recipe. Connect your backend to process real videos!');
    } finally {
      setLoading(false);
    }
  };

  const openVideoUrl = () => {
    if (videoUrl && validateVideoUrl(videoUrl)) {
      Linking.openURL(videoUrl);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Video to Recipe</Text>
        <Text style={styles.subtitle}>
          Paste a cooking video link to generate a recipe
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Video URL</Text>
        <TextInput
          style={styles.input}
          value={videoUrl}
          onChangeText={setVideoUrl}
          placeholder="https://youtube.com/watch?v=... or Instagram/TikTok link"
          placeholderTextColor="#666"
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={generateRecipe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate Recipe</Text>
            )}
          </TouchableOpacity>

          {videoUrl && validateVideoUrl(videoUrl) && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={openVideoUrl}
            >
              <Text style={styles.secondaryButtonText}>View Video</Text>
            </TouchableOpacity>
          )}
        </View>

        {videoUrl && validateVideoUrl(videoUrl) && (
          <Text style={styles.platformText}>
            Platform: {getPlatform(videoUrl)}
          </Text>
        )}
      </View>


      {statusMessage && (
        <Text style={{ color: statusMessage.includes('error') || statusMessage.includes('not found') ? 'red' : 'green', textAlign: 'center', marginVertical: 10 }}>
          {statusMessage}
        </Text>
      )}

      {transcript && (
        <View style={{ backgroundColor: '#f0f0f0', margin: 10, padding: 10, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Transcript:</Text>
          <Text style={{ fontSize: 13, color: '#333' }}>{transcript}</Text>
        </View>
      )}

      {recipe && (
        <View style={styles.recipeSection}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <View style={styles.recipeMetrics}>
              <Text style={styles.metric}>⏱️ {recipe.cookTime}</Text>
              <Text style={styles.metric}>🍽️ {recipe.servings} servings</Text>
              <Text style={styles.metric}>📊 {recipe.difficulty}</Text>
            </View>
          </View>

          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => (
                <Text key={index} style={styles.ingredient}>
                  • {ingredient}
                </Text>
              ))
            ) : (
              <Text style={styles.ingredient}>No ingredients found.</Text>
            )}
          </View>

          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {Array.isArray(recipe.steps) && recipe.steps.length > 0 ? (
              recipe.steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.ingredient}>No instructions found.</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  platformText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recipeSection: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  recipeHeader: {
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  metric: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  ingredientsSection: {
    marginBottom: 25,
  },
  ingredient: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    lineHeight: 24,
  },
  stepsSection: {
    marginBottom: 10,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    backgroundColor: '#007AFF',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 15,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});