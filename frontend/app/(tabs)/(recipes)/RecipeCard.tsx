import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Button, Share, StyleSheet } from 'react-native';
import { Recipe } from '../../../services/recipeService';

interface RecipeCardProps {
  item: Recipe;
  userId: string;
  onDelete: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ item, userId, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${item.title}\n\nIngredients: ${item.ingredients?.join(", ")}\n\nSteps: ${item.steps?.join("\n")}`,
      });
    } catch (error) {
      console.error("Error sharing recipe:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.metricRow}>
        <Text style={styles.metric}>⏱️ {item.cook_time}</Text>
        <Text style={styles.metric}>🍽️ {item.servings} servings</Text>
        <Text style={styles.metric}>📊 {item.difficulty}</Text>
      </View>
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{item.title}</Text>
          <Text style={styles.modalSubtitle}>Ingredients:</Text>
          {item.ingredients?.map((ingredient, index) => (
            <Text key={index} style={styles.modalText}>{ingredient}</Text>
          ))}
          <Text style={styles.modalSubtitle}>Steps:</Text>
          {item.steps?.map((step, index) => (
            <Text key={index} style={styles.modalText}>{index + 1}. {step}</Text>
          ))}
          <View style={styles.modalButtonRow}>
            <Button title="Delete" onPress={() => onDelete(item)} color="#dc2626" />
            <Button title="Share" onPress={handleShare} color="#52b788" />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    padding: 8,
  },
  metric: {
    fontSize: 14,
    color: '#2d6a4f',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b4332',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 4,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default RecipeCard;