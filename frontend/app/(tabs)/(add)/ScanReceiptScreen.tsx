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
      Alert.alert('Camera Permission Required', 'We need camera access to scan receipts.');
      return false;
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photo Library Permission Required', 'We need photo library access to select receipt images.');
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
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        setScannedReceipts(prev => [...prev, result.assets[0].uri]);
        Alert.alert('Receipt Scanned!', 'Receipt has been captured successfully.');
      }
    } catch {
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
    } catch {
      Alert.alert('Error', 'Failed to select receipt');
    }
  };

  const showReceiptOptions = () => {
    Alert.alert('Add Receipt', 'How would you like to add your receipt?', [
      { text: '📸 Scan with Camera', onPress: scanReceiptWithCamera },
      { text: '🖼️ Select from Photos', onPress: selectReceiptFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeReceipt = (index: number) => {
    Alert.alert('Remove Receipt', 'Are you sure you want to remove this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Remove', 
        style: 'destructive',
        onPress: () => setScannedReceipts(prev => prev.filter((_, i) => i !== index))
      },
    ]);
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
      <Text style={styles.title}>🧾 Scan Receipts</Text>
      <Text style={styles.subtitle}>Capture or select receipts to extract data</Text>

      <TouchableOpacity style={styles.scanButton} onPress={showReceiptOptions}>
        <Text style={styles.scanButtonText}>+ Add Receipt</Text>
      </TouchableOpacity>

      {scannedReceipts.length > 0 && (
        <View style={styles.receiptsContainer}>
          <Text style={styles.sectionTitle}>Scanned ({scannedReceipts.length})</Text>
          <View style={styles.receiptsGrid}>
            {scannedReceipts.map((uri, index) => (
              <View key={index} style={styles.receiptWrapper}>
                <Image source={{ uri }} style={styles.receiptImage} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeReceipt(index)}>
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
        <Text style={styles.tipTitle}>💡 Tips for Better Scanning</Text>
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
    backgroundColor: '#eaf8ea', // soft green background
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a531b',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4d784e',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#34c759',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 25,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  receiptsContainer: {
    width: '100%',
    marginTop: 10,
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
  receiptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  receiptWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  receiptImage: {
    width: (width - 80) / 2,
    height: (width - 80) / 2 * 1.3,
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
  receiptOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#00000070',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  receiptNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  processButton: {
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
  processButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tipContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
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
});
