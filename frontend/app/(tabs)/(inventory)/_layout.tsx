import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
  StatusBar,
  Platform,
} from 'react-native';

// Sample data (make sure to replace with your real image URLs)
const images = [
  { id: '1', uri: 'https://placekitten.com/200/200', name: 'Kitten 1', color: '#f4d35e' },
  { id: '2', uri: 'https://placekitten.com/201/201', name: 'Kitten 2', color: '#f28a8a' },
  { id: '3', uri: 'https://placekitten.com/202/202', name: 'Kitten 3', color: '#8ac6d1' },
  { id: '4', uri: 'https://placekitten.com/203/203', name: 'Kitten 4', color: '#a3d39c' },
  { id: '5', uri: 'https://placekitten.com/204/204', name: 'Kitten 5', color: '#f4d35e' },
  { id: '6', uri: 'https://placekitten.com/205/205', name: 'Kitten 6', color: '#f28a8a' },
];

// Number of columns and card sizing
const numColumns = 3;
const cardMargin = 16;
const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

// Reusable FruitCard component (now with image and label)
function FruitCard({
  name,
  color,
  uri,
}: {
  name: string;
  color: string;
  uri: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Image source={{ uri }} style={styles.image} />
      <Text style={styles.cardText}>{name}</Text>
    </View>
  );
}

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Food Inventory</Text>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <FruitCard name={item.name} color={item.color} uri={item.uri} />
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: cardMargin / 2,
  },
  row: {
    justifyContent: 'center',
  },
  card: {
    width: imageSize,
    margin: cardMargin / 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',

    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,

    // Elevation for Android
    elevation: 4,
  },
  image: {
    width: '100%',
    height: imageSize,
    resizeMode: 'cover',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    padding: 8,
  },
});