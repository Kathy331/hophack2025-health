import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Recipe, Item } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

interface RecipeCardProps {
  recipe: Recipe;
  available: Item[];
}

export default function RecipeCard({ recipe, available }: RecipeCardProps) {
  const availableIngredients = recipe.ingredients?.filter(ingredient =>
    available.some(item => 
      ingredient.toLowerCase().includes(item.name.toLowerCase())
    )
  ) || [];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{recipe.title}</Text>
      
      <View style={styles.metrics}>
        <Text style={styles.metric}>⏱️ {recipe.cook_time}</Text>
        <Text style={styles.metric}>📊 {recipe.difficulty}</Text>
      </View>

      <View style={styles.ingredientsSection}>
        <Text style={styles.sectionTitle}>Ingredients:</Text>
        {recipe.ingredients?.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <MaterialIcons 
              name={availableIngredients.includes(ingredient) ? "check-circle" : "add-circle"} 
              size={16} 
              color={availableIngredients.includes(ingredient) ? "#4CAF50" : "#FFA726"}
            />
            <Text style={styles.ingredient}>{ingredient}</Text>
          </View>
        ))}
      </View>

      {recipe.url && (
        <TouchableOpacity style={styles.videoButton}>
          <MaterialIcons name="play-circle-fill" size={18} color="#FF0000" />
          <Text style={styles.videoText}>Watch Video</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C6E49',
    marginBottom: 10,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metric: {
    fontSize: 14,
    color: '#666',
  },
  ingredientsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C6E49',
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ingredient: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3F3',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  videoText: {
    color: '#FF0000',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});