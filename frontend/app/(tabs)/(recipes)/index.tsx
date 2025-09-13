import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  View,
  Text,
} from 'react-native';
import AddRecipeScreen from './AddRecipeScreen';
import SavedRecipesScreen from './SavedRecipesScreen';

type TabType = 'add' | 'saved';

export default function RecipesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('add');

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddRecipeScreen />;
      case 'saved':
        return <SavedRecipesScreen />;
      default:
        return <AddRecipeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f7f3" />

      {/* Toggle Header */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleButtonLeft,
            activeTab === 'add' && styles.toggleButtonActive,
          ]}
          onPress={() => setActiveTab('add')}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === 'add' && styles.toggleTextActive,
            ]}
          >
            Add Recipe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.toggleButtonRight,
            activeTab === 'saved' && styles.toggleButtonActive,
          ]}
          onPress={() => setActiveTab('saved')}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === 'saved' && styles.toggleTextActive,
            ]}
          >
            Saved Recipes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f7f3',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: '#dce6df',
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
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4d6651',
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