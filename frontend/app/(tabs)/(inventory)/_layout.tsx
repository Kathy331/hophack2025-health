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
  { id: '1', uri: 'https://placekitten.com/200/200', name: 'apple', color: '#B4E197', foodLocation: 'onShelf' },
  { id: '2', uri: 'https://placekitten.com/201/201', name: 'orange', color: '#A0D995', foodLocation: 'onShelf'  },
  { id: '3', uri: 'https://placekitten.com/202/202', name: 'lettuce', color: '#83BD75', foodLocation: 'fridge'  },
  { id: '4', uri: 'https://placekitten.com/203/203', name: 'meat', color: '#4E944F', foodLocation: 'fridge' },
  { id: '5', uri: 'https://placekitten.com/204/204', name: 'cod', color: '#B4E197', foodLocation: 'fridge'  },
  { id: '6', uri: 'https://placekitten.com/205/205', name: 'bananas', color: '#A0D995', foodLocation: 'onShelf'   },
  { id: '7', uri: 'https://placekitten.com/200/200', name: 'apple', color: '#B4E197', foodLocation: 'fridge' },
  { id: '8', uri: 'https://placekitten.com/201/201', name: 'orange', color: '#A0D995', foodLocation: 'onShelf'  },
  { id: '9', uri: 'https://placekitten.com/202/202', name: 'lettuce', color: '#83BD75', foodLocation: 'fridge'  },
  { id: '10', uri: 'https://placekitten.com/203/203', name: 'meat', color: '#6cb06dff', foodLocation: 'freezer' },
  { id: '11', uri: 'https://placekitten.com/204/204', name: 'cod', color: '#B4E197', foodLocation: 'freezer'  },
  { id: '12', uri: 'https://placekitten.com/205/205', name: 'bananas', color: '#A0D995', foodLocation: 'onShelf' },
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
  const [viewMode, setViewMode] = useState<'shelf' | 'fridge' | 'freezer'>('shelf');


const locationMap = {
  shelf: 'onShelf',
  fridge: 'fridge',
  freezer: 'freezer',
};

const filteredImages = images.filter(item => item.foodLocation === locationMap[viewMode]);




  const rows = [];
  for (let i = 0; i < filteredImages.length; i += numColumns) {
    rows.push(filteredImages.slice(i, i + numColumns));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF8E6" />
      <Text style={styles.header}>🌱 Inventory</Text>

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
        <Text
          style={[
          styles.toggleButton,
          viewMode === 'freezer' && styles.activeToggleButton,
          ]}
          onPress={() => setViewMode('freezer')}
        >
          Freezer
        </Text>
      </View>
    <View
      style={[
        styles.shelfArea,
        viewMode === 'fridge' && styles.fridgeBackground, // Apply gray background only in fridge mode
        viewMode === 'freezer' && [styles.fridgeBackground, styles.freezerGlowContainer],
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
          viewMode === 'fridge' && { backgroundColor: '#e4fdf4ff' }, // ⬅️ override color if fridge
          viewMode === 'freezer' && { backgroundColor: '#e4fdf4ff'},
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    paddingTop: 40,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: -10,
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
    bottom: -20,
    left: 0,
    right: 0,
    height: 30,
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
  backgroundColor: '#abcdbcff', // Light gray background
  borderWidth: 3,
   borderColor: '#ffffffff',
  borderRadius: 20,
},
freezerGlowContainer: {
  borderWidth: 3,
  borderColor: '#98eef0ff',
  shadowColor: '#8de4faff',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 15,
  elevation: 15,
  borderRadius: 20,
  margin: 5,  // optional: give some spacing around glow
},


});
