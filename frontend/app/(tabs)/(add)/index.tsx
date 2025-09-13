import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import ImageUploadScreen from './ImageUploadScreen';
import ScanReceiptScreen from './ScanReceiptScreen';

type TabType = 'images' | 'receipt';

export default function AddScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('images');

  const renderContent = () => {
    switch (activeTab) {
      case 'images':
        return <ImageUploadScreen />;
      case 'receipt':
        return <ScanReceiptScreen />;
      default:
        return <ImageUploadScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Toggle Header */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleButtonLeft,
            activeTab === 'images' && styles.toggleButtonActive
          ]}
          onPress={() => setActiveTab('images')}
        >
          <Text style={[
            styles.toggleText,
            activeTab === 'images' && styles.toggleTextActive
          ]}>
            Add Photos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleButtonRight,
            activeTab === 'receipt' && styles.toggleButtonActive
          ]}
          onPress={() => setActiveTab('receipt')}
        >
          <Text style={[
            styles.toggleText,
            activeTab === 'receipt' && styles.toggleTextActive
          ]}>
            Scan Receipt
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f7f3', // soft eco-friendly green background
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: '#dce6df', // muted light green-gray
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
  },
  toggleButtonRight: {
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50', // natural green
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4d6651', // earthy gray-green for inactive tab text
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
});
