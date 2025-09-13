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
    backgroundColor: '#f5f5f5',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  toggleButtonRight: {
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
});