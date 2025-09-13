import React, { useState } from 'react';
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

const images = [
  { id: '1', uri: 'https://placekitten.com/200/200', name: 'apple', color: '#B4E197', frigeFlag: true },
  { id: '2', uri: 'https://placekitten.com/201/201', name: 'orange', color: '#A0D995', frigeFlag: false  },
  { id: '3', uri: 'https://placekitten.com/202/202', name: 'lettuce', color: '#83BD75', frigeFlag: true  },
  { id: '4', uri: 'https://placekitten.com/203/203', name: 'meat', color: '#4E944F', frigeFlag: true  },
  { id: '5', uri: 'https://placekitten.com/204/204', name: 'cod', color: '#B4E197', frigeFlag: true  },
  { id: '6', uri: 'https://placekitten.com/205/205', name: 'bananas', color: '#A0D995', frigeFlag: false  },
  { id: '7', uri: 'https://placekitten.com/200/200', name: 'apple', color: '#B4E197', frigeFlag: true },
  { id: '8', uri: 'https://placekitten.com/201/201', name: 'orange', color: '#A0D995', frigeFlag: false  },
  { id: '9', uri: 'https://placekitten.com/202/202', name: 'lettuce', color: '#83BD75', frigeFlag: true  },
  { id: '10', uri: 'https://placekitten.com/203/203', name: 'meat', color: '#4E944F', frigeFlag: true  },
  { id: '11', uri: 'https://placekitten.com/204/204', name: 'cod', color: '#B4E197', frigeFlag: true  },
  { id: '12', uri: 'https://placekitten.com/205/205', name: 'bananas', color: '#A0D995', frigeFlag: false  },
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
  // ✅ Moved here
  const [viewMode, setViewMode] = useState<'shelf' | 'fridge'>('shelf');

  // Optionally filter items based on the view mode
// ✅ Filter based on fridgeFlag
const filteredImages =
  viewMode === 'shelf'
    ? images.filter(item => !item.frigeFlag)
    : images.filter(item => item.frigeFlag);


  const rows = [];
  for (let i = 0; i < filteredImages.length; i += numColumns) {
    rows.push(filteredImages.slice(i, i + numColumns));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF8E6" />
      <Text style={styles.header}>🌱 Food Inventory</Text>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <Text
          style={[
            styles.toggleButton,
            viewMode === 'shelf' && styles.activeToggleButton,
          ]}
          onPress={() => setViewMode('shelf')}
        >
          Shelf
        </Text>
        <Text
          style={[
            styles.toggleButton,
            viewMode === 'fridge' && styles.activeToggleButton,

          ]}
          onPress={() => setViewMode('fridge')}
        >
          Fridge
        </Text>
      </View>

    <View
      style={[
        styles.shelfArea,
        viewMode === 'fridge' && styles.fridgeBackground, // Apply gray background only in fridge mode
      ]}
    >

      <FlatList
        data={rows}
        keyExtractor={(_, index) => `row-${index}`}
        renderItem={({ item: rowItems }) => (
          <View style={styles.shelfRow}>
            {rowItems.map((item) => (
              <FruitCard key={item.id} name={item.name} color={item.color} uri={item.uri} />
            ))}
           <View
            style={[
          styles.shelfLine,
          viewMode === 'fridge' && { backgroundColor: '#ffffffff' }, // ⬅️ override color if fridge
        ]}
      />
    </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8E6',
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
  shelfRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: cardMargin,
    paddingTop: 20,
    position: 'relative',
  },
  card: {
    width: imageSize,
    marginHorizontal: cardMargin / 2,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#D0F0C0',

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
  shelfLine: {
    position: 'absolute',
    bottom: -cardMargin / 2,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#792525ff',
    borderRadius: 2,
    zIndex: -1,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  toggleButton: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C6E49',
    color: '#2C6E49',
    fontWeight: '600',
  },
  activeToggleButton: {
    backgroundColor: '#2C6E49',
    color: '#FFFFFF',
  },
  shelfArea: {
  flex: 1,
},

fridgeBackground: {
  backgroundColor: '#D3D3D3', // Light gray background
},

});
