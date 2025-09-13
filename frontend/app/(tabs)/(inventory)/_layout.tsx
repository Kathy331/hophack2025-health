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

// Sample data — updated colors to fit green, eco-friendly theme
const images = [
  { id: '1', uri: 'https://placekitten.com/200/200', name: 'Kitten 1', color: '#B4E197' },
  { id: '2', uri: 'https://placekitten.com/201/201', name: 'Kitten 2', color: '#A0D995' },
  { id: '3', uri: 'https://placekitten.com/202/202', name: 'Kitten 3', color: '#83BD75' },
  { id: '4', uri: 'https://placekitten.com/203/203', name: 'Kitten 4', color: '#4E944F' },
  { id: '5', uri: 'https://placekitten.com/204/204', name: 'Kitten 5', color: '#B4E197' },
  { id: '6', uri: 'https://placekitten.com/205/205', name: 'Kitten 6', color: '#A0D995' },
];

const numColumns = 3;
const cardMargin = 16;
const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

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
      <StatusBar barStyle="dark-content" backgroundColor="#EAF8E6" />
      <Text style={styles.header}>🌱 Food Inventory</Text>
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
    backgroundColor: '#EAF8E6', // soft green background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 40 : 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C6E49',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
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
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#D0F0C0',

    // Soft shadow for Duolingo-like floating feel
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: imageSize,
    resizeMode: 'cover',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2C6E49',
    fontWeight: '600',
    paddingVertical: 8,
  },
});
