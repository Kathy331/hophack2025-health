import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Recipe, Item } from '../types';
import RecipeCard from './RecipeCard';

interface RecommendationsModalProps {
  visible: boolean;
  onClose: () => void;
  recipes: Recipe[];
  inventory: Item[];
  loading: boolean;
}

export default function RecommendationsModal({
  visible,
  onClose,
  recipes,
  inventory,
  loading
}: RecommendationsModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recipe Recommendations</Text>
          
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#52b788" />
              <Text style={styles.loadingText}>Finding recipes for you...</Text>
            </View>
          ) : recipes.length > 0 ? (
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.recipeScroll}
            >
              {recipes.map((recipe, index) => (
                <RecipeCard 
                  key={recipe.id || index}
                  recipe={recipe}
                  available={inventory}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                No recipe suggestions available.{'\n'}Add more recipes to get personalized recommendations!
              </Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C6E49',
    textAlign: 'center',
    marginBottom: 20,
  },
  recipeScroll: {
    flexGrow: 0,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#52b788',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});