import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  TextInput,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { sendReceiptToBackend, finalizeItems, FinalizeItemsPayload, Item} from '../../../services/geminiService';
const { width } = Dimensions.get('window');
import { supabase } from '../../../supabaseClient';

interface ParsedItem {
  name: string;
  estimated_expiration: string | null;
  storage_option: 'F' | 'R' | 'S' | null;
}

export default function ScanReceiptScreen() {
  const [scannedReceipts, setScannedReceipts] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingExpiration, setEditingExpiration] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Permissions and image pickers
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
      setParsedItems([]);
      setModalVisible(true);
      return;
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setParsedItems([]);
        setModalVisible(true);
        return;
      }

      const allParsedItems: ParsedItem[] = [];

      for (const uri of scannedReceipts) {
        const parsed = await sendReceiptToBackend(uri);
        if (parsed.items && Array.isArray(parsed.items)) {
          parsed.items.forEach((item: { name: string; estimated_expiration?: string }) => {
            allParsedItems.push({ 
              name: item.name, 
              estimated_expiration: item.estimated_expiration || null, 
              storage_option: null 
            });
          });
        }
      }

      setParsedItems(allParsedItems);
      setModalVisible(true);

    } catch (error) {
      console.error('Error processing receipts:', error);
      setParsedItems([]);
      setModalVisible(true);
    }
  };

  const selectStorageOption = (index: number, option: 'F' | 'R' | 'S') => {
    const newItems = [...parsedItems];
    newItems[index].storage_option = option;
    setParsedItems(newItems);
  };

  const startEditItem = (index: number) => {
    setEditingIndex(index);
    setEditingName(parsedItems[index].name);
    setEditingExpiration(parsedItems[index].estimated_expiration || '');
    setEditMode(true);
  };

  const saveEditedItem = () => {
    if (editingIndex === null) return;
    const newItems = [...parsedItems];
    newItems[editingIndex].name = editingName;
    newItems[editingIndex].estimated_expiration = editingExpiration;
    setParsedItems(newItems);
    setEditMode(false);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setEditingExpiration(formatted);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error("User not found");
  
      const payload: FinalizeItemsPayload = {
        user_uuid: data.user.id,
        items_json: {
          items: parsedItems.map(item => ({
            name: item.name,
            date_bought: new Date().toISOString().split("T")[0], // default today
            price: 0, // default price if you don’t have one
            estimated_expiration: item.estimated_expiration || undefined,
            storage_location: item.storage_option || undefined, // <--- undefined instead of null
          })),
        },
      };
  
      const result = await finalizeItems(payload);
      Alert.alert("Success", "Items submitted successfully!");
      setModalVisible(false);
      setParsedItems([]);
      setScannedReceipts([]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit items");
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

      {/* Single Modal for viewing and editing */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!editMode ? (
              <>
                <Text style={[styles.modalTitle, { marginTop: 0 }]}>🧾 Items Found</Text>
                <ScrollView style={{ maxHeight: '65%' }}>
                  {parsedItems.length > 0 ? (
                    parsedItems.map((item, index) => (
                      <TouchableOpacity key={index} style={styles.itemRow} onPress={() => startEditItem(index)}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.expirationText}>
                            Est. Exp: {item.estimated_expiration || 'Unknown'}
                          </Text>
                        </View>
                        <View style={styles.storageOptions}>
                          {(['F','R','S'] as const).map(option => {
                            const isSelected = item.storage_option === option;
                            return (
                              <TouchableOpacity
                                key={option}
                                style={[
                                  styles.storageButton,
                                  isSelected && styles.storageButtonSelected
                                ]}
                                onPress={() => selectStorageOption(index, option)}
                              >
                                <Text style={[styles.storageButtonText, isSelected && styles.storageButtonSelectedText]}>
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.modalText}>No items found.</Text>
                  )}
                </ScrollView>

                {/* Submit Button */}
                <TouchableOpacity 
                  style={[styles.submitButton, { marginTop: 10 }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.closeButtonText}>Submit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.closeButton, { marginTop: 10 }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Edit Item</Text>
                <TextInput
                  style={styles.inputField}
                  value={editingName}
                  onChangeText={setEditingName}
                  placeholder="Item name"
                  autoFocus
                />
                <TouchableOpacity style={styles.inputField} onPress={() => setShowDatePicker(true)}>
                  <Text>{editingExpiration || 'Select Estimated Expiration'}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={editingExpiration ? new Date(editingExpiration) : new Date()}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                  />
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <TouchableOpacity
                    style={[styles.closeButton, { flex: 1, marginRight: 5 }]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.closeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, { flex: 1, marginLeft: 5 }]}
                    onPress={saveEditedItem}
                  >
                    <Text style={styles.closeButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Styles remain mostly the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eaf8ea' },
  contentContainer: { padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#1a531b', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#4d784e', textAlign: 'center', marginBottom: 20 },
  scanButton: { backgroundColor: '#34c759', paddingHorizontal: 35, paddingVertical: 15, borderRadius: 30, marginBottom: 25 },
  scanButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  receiptsContainer: { width: '100%', marginTop: 10, backgroundColor: '#ffffff', borderRadius: 16, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#1a531b' },
  receiptsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  receiptWrapper: { position: 'relative', marginBottom: 12 },
  receiptImage: { width: (width - 80) / 2, height: (width - 80) / 2 * 1.3, borderRadius: 14, backgroundColor: '#c8e6c9' },
  removeButton: { position: 'absolute', top: 5, right: 5, backgroundColor: '#00000080', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  removeButtonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  receiptOverlay: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#00000070', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  receiptNumber: { color: '#fff', fontSize: 12, fontWeight: '600' },
  processButton: { backgroundColor: '#1db954', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, marginTop: 20 },
  processButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  tipContainer: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, width: '100%', marginTop: 20 },
  tipTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#1a531b' },
  tipText: { fontSize: 14, color: '#4d784e', marginBottom: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    width: '90%', 
    maxHeight: '80%', 
    justifyContent: 'flex-end' 
  },

  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#1a531b', textAlign: 'center' },
  modalText: { textAlign: 'center', color: '#4d784e', fontSize: 16 },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemName: { fontSize: 16, color: '#1a531b', flex: 1 },
  expirationText: { fontSize: 12, color: '#4d784e' },
  storageOptions: { flexDirection: 'row', marginLeft: 10 },
  storageButton: { borderWidth: 1, borderColor: '#83BD75', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 5 },
  storageButtonSelected: { backgroundColor: '#83BD75' },
  storageButtonText: { color: '#83BD75', fontWeight: '700' },
  storageButtonSelectedText: { color: '#fff' },

  closeButton: { backgroundColor: '#83BD75', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  submitButton: { backgroundColor: '#1db954', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  inputField: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 12, 
    width: '100%', 
    paddingHorizontal: 10, 
    paddingVertical: 12, 
    marginBottom: 10,
    justifyContent: 'center'
  },
});
