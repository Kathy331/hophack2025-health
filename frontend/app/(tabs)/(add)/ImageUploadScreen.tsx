import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView,
  Dimensions 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeImageWithGemini } from '../../../services/geminiService'; // Make sure this path is correct

const { width } = Dimensions.get('window');

export default function ImageUploadScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload photos.'
      );
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImageFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Photos', 'Please select at least one photo to upload.');
      return;
    }

    Alert.alert(
      'Process Images',
      'What would you like to do with your images?',
      [
        {
          text: 'Analyze with AI',
          onPress: () => analyzeImagesWithGemini()
        },
        {
          text: 'Just Upload',
          onPress: () => {
            Alert.alert('Success', `${selectedImages.length} photo(s) uploaded!`);
            // Handle regular upload logic here
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const analyzeImagesWithGemini = async () => {
    if (selectedImages.length === 0) return;

    setLoading(true);
    try {
      Alert.alert('Processing...', 'Analyzing your images with AI. This may take a moment.');

      if (selectedImages.length === 1) {
        const result = await analyzeImageWithGemini(selectedImages[0]);
        // Check for empty items array
        if (!result || !result.items || result.items.length === 0) {
          Alert.alert(
            'No Food Items Found',
            'The AI could not detect any food items in your image. Please try a clearer photo.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'AI Analysis Result',
            JSON.stringify(result, null, 2),
            [{ text: 'OK' }]
          );
        }
      } else {
        let analysisText = '';
        for (let i = 0; i < selectedImages.length; i++) {
          try {
            const result = await analyzeImageWithGemini(selectedImages[i]);
            if (!result || !result.items || result.items.length === 0) {
              analysisText += `Image ${i + 1}: No food items found.\n\n`;
            } else {
              analysisText += `Image ${i + 1}:\n${JSON.stringify(result, null, 2)}\n\n`;
            }
          } catch (imgError) {
            analysisText += `Image ${i + 1}: Error analyzing image.\n\n`;
          }
        }
        Alert.alert(
          'AI Analysis Results',
          analysisText,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze images. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      console.error('Gemini analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Add Photos</Text>
      
      <TouchableOpacity style={styles.addButton} onPress={showImageOptions}>
        <Text style={styles.addButtonText}>+ Add Photo</Text>
      </TouchableOpacity>

      {selectedImages.length > 0 && (
        <View style={styles.imageContainer}>
          <Text style={styles.sectionTitle}>Selected Photos ({selectedImages.length})</Text>
          <View style={styles.imageGrid}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {selectedImages.length > 0 && (
        <TouchableOpacity style={styles.uploadButton} onPress={uploadPhotos} disabled={loading}>
          <Text style={styles.uploadButtonText}>
            {loading ? 'Processing...' : `Upload ${selectedImages.length} Photo${selectedImages.length > 1 ? 's' : ''}`}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: (width - 60) / 2,
    height: (width - 60) / 2,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});