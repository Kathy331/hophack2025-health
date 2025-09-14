import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import FoodWastePreview from '../../components/FoodWastePreview';
import CostsPreview from '../../components/CostsPreview';
import RecommendationPreview from '../../components/RecommendationPreview';
import { getCurrentUser } from '../../services/userService';
import { backendUrl } from '../../config';

export default function HomePage() {
  const [expiringItems, setExpiringItems] = useState<string[]>([]);

  // Fetch expiring items on mount
  useEffect(() => {
    const fetchExpiringItems = async () => {
      const { user } = await getCurrentUser();
      if (!user) return;

      const response = await fetch(`${backendUrl}/items?userId=${user.id}`);
      if (!response.ok) return;
      const { items } = await response.json();

      interface Item {
        estimated_expiration: string | null;
        name: string;
      }
      
      const expiring = (items || []).filter((item: Item) => {
        if (!item.estimated_expiration) return false;
        const expirationDate = new Date(item.estimated_expiration);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return expirationDate <= weekFromNow;
      });

      setExpiringItems(expiring.map((item: Item) => item.name));
    };

    fetchExpiringItems();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Header />
      <FoodWastePreview />
      <CostsPreview />
      <RecommendationPreview expiringItems={expiringItems} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f7f3',
    padding: 16,
  },
});