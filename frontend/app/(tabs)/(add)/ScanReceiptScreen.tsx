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
import { sendReceiptToBackend } from '../../../services/geminiService';
const { width } = Dimensions.get('window');
import { supabase } from '../../../supabaseClient';


export default function ScanReceiptScreen() {
  const [scannedReceipts, setScannedReceipts] = useState<string[]>([]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'We need camera access to scan receipts.'
      );
      return false;
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'We need photo library access to select receipt images.'
      );
      return false;
    }
    return true;
  };

  const scanReceiptWithCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4], // Better aspect ratio for receipts
        quality: 1, // Higher quality for OCR
      });

      if (!result.canceled && result.assets?.[0]) {
        setScannedReceipts(prev => [...prev, result.assets[0].uri]);
        Alert.alert('Receipt Scanned!', 'Receipt has been captured successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan receipt');
    }
  };

  const selectReceiptFromLibrary = async () => {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        setScannedReceipts(prev => [...prev, result.assets[0].uri]);
        Alert.alert('Receipt Added!', 'Receipt image has been added successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select receipt');
    }
  };

  const showReceiptOptions = () => {
    Alert.alert(
      'Add Receipt',
      'How would you like to add your receipt?',
      [
        { text: 'Scan with Camera', onPress: scanReceiptWithCamera },
        { text: 'Select from Photos', onPress: selectReceiptFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeReceipt = (index: number) => {
    Alert.alert(
      'Remove Receipt',
      'Are you sure you want to remove this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setScannedReceipts(prev => prev.filter((_, i) => i !== index))
        },
      ]
    );
  };


const processReceipts = async () => {
  if (scannedReceipts.length === 0) {
    Alert.alert('No Receipts', 'Please scan or add at least one receipt.');
    return;
  }

  try {
    // 1️⃣ Get the logged-in user
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      Alert.alert('Not Authenticated', 'Please log in before uploading receipts.');
      return;
    }
    const userId = data.user.id; // ✅ this is the UUID
    console.log("Logged-in user ID:", userId);

    Alert.alert('Processing Receipts', `Processing ${scannedReceipts.length} receipt(s)...`);

    const allParsedResults = [];

    for (const uri of scannedReceipts) {
      // 2️⃣ Pass the userId to the backend
      const parsed = await sendReceiptToBackend(uri, userId);
      allParsedResults.push(parsed);
    }

    console.log("Parsed Receipts:", allParsedResults);
    Alert.alert('Success', 'Receipts processed successfully! Check console for JSON.');

    // Optionally: clear receipts after processing
    // setScannedReceipts([]);

  } catch (error) {
    console.error("Error processing receipts:", error);
    Alert.alert('Error', 'Failed to process receipts. See console for details.');
  }
};



  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Scan Receipts</Text>
      <Text style={styles.subtitle}>Capture or select receipt images to extract data</Text>
      
      <TouchableOpacity style={styles.scanButton} onPress={showReceiptOptions}>
        <Text style={styles.scanButtonText}>📄 Add Receipt</Text>
      </TouchableOpacity>

      {scannedReceipts.length > 0 && (
        <View style={styles.receiptsContainer}>
          <Text style={styles.sectionTitle}>Scanned Receipts ({scannedReceipts.length})</Text>
          <View style={styles.receiptsGrid}>
            {scannedReceipts.map((uri, index) => (
              <View key={index} style={styles.receiptWrapper}>
                <Image source={{ uri }} style={styles.receiptImage} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeReceipt(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
                <View style={styles.receiptOverlay}>
                  <Text style={styles.receiptNumber}>#{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {scannedReceipts.length > 0 && (
        <TouchableOpacity style={styles.processButton} onPress={processReceipts}>
          <Text style={styles.processButtonText}>
            Process {scannedReceipts.length} Receipt{scannedReceipts.length > 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>💡 Tips for better scanning:</Text>
        <Text style={styles.tipText}>• Ensure good lighting</Text>
        <Text style={styles.tipText}>• Keep receipt flat and straight</Text>
        <Text style={styles.tipText}>• Include all text in the frame</Text>
        <Text style={styles.tipText}>• Avoid shadows and glare</Text>
      </View>
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
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  receiptsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  receiptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  receiptWrapper: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  receiptImage: {
    width: (width - 60) / 2,
    height: (width - 60) / 2 * 1.3, // Taller aspect ratio for receipts
    backgroundColor: '#ddd',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  receiptOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  receiptNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  processButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  processButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  tipContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});