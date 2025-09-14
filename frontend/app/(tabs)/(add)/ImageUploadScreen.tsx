import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeImageWithGemini } from '../../../services/geminiService';
import { supabase } from '../../../supabaseClient';

const { width } = Dimensions.get('window');

export default function ImageUploadScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photos to continue.');
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
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your camera.');
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
    } catch {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert('Select Photo', 'Choose how you want to add a photo', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImageFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeImagesWithGemini = async () => {
    if (selectedImages.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      const user_uuid = data.user.id;

      for (const image of selectedImages) {
        await analyzeImageWithGemini(image, user_uuid); // ✅ pass user_uuid
      }
    } catch {
      Alert.alert('Analysis Failed', 'Unable to analyze images.');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Photos', 'Please select at least one photo.');
      return;
    }

    await analyzeImagesWithGemini();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>🌱 Add Your Photos</Text>
        <Text style={styles.subtitle}>Take a picture of one or multiple food items to upload</Text>
        <TouchableOpacity style={styles.addButton} onPress={showImageOptions}>
          <Text style={styles.addButtonText}>+ Add Photo</Text>
        </TouchableOpacity>

        {selectedImages.length > 0 && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Selected ({selectedImages.length})</Text>
            <View style={styles.imageGrid}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedImages.length > 0 && (
          <TouchableOpacity style={[styles.uploadButton, loading && { opacity: 0.6 }]} onPress={uploadPhotos} disabled={loading}>
            <Text style={styles.uploadButtonText}>
              {loading ? 'Processing...' : `Upload ${selectedImages.length} Photo${selectedImages.length > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* === Tips Section === */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>💡 Tips for Better Photos</Text>
          <Text style={styles.tipText}>• Ensure good lighting for clearer results</Text>
          <Text style={styles.tipText}>• Avoid blurry or shaky images</Text>
          <Text style={styles.tipText}>• Center the subject(s) in the frame</Text>
          <Text style={styles.tipText}>• Keep background minimal to avoid distractions</Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1db954" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf8ea',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a531b',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#34c759',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#1a531b',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: (width - 80) / 2,
    height: (width - 80) / 2,
    borderRadius: 14,
    backgroundColor: '#c8e6c9',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#00000080',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  uploadButton: {
    backgroundColor: '#1db954',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tipContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginTop: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#d9e7d9',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1a531b',
  },
  tipText: {
    fontSize: 14,
    color: '#4d784e',
    marginBottom: 4,
    
  },
   subtitle: {
    fontSize: 16,
    color: '#4d784e',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
