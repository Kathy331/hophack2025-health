import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Stack as ExpoStack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RecipeRecommendations from '../(recipes)/RecipeRecommendations';

function Dashboard() {
  return (
    <SafeAreaView style={[styles.container, styles.dashboardContainer]}>
      <Text style={[styles.dashboardTitle, { marginTop: 20 }]}>Guess how much food you've saved already? 🍏</Text>
      <Image
        source={require('../../../assets/images/bar_graph_with_average.png')}
        style={styles.dashboardImageLarge}
      />
    </SafeAreaView>
  );
}

function DashboardCosts() {
  return (
    <SafeAreaView style={[styles.container, styles.dashboardContainer]}>
      <Text style={[styles.dashboardTitle, { marginTop: 20 }]}>How much are you saving? 💰</Text>
      <Image
        source={require('../../../assets/images/money_graph.png')}
        style={styles.dashboardImageLarge}
      />
    </SafeAreaView>
  );
}


// --- Types ---
type Item = {
  key: string;
  label: string;
  expDate?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
};

type Section = {
  title?: string;
  data: Item[];
};

// --- Sections Data ---
const recommendations: Section[] = [
  {
    title: '🌱 Inventory Recommendations',
    data: [
      {
        key: 'recommendations',
        label: 'Why not bake a batch of apple muffins with your apples before they go bad this week? 📝', 
        containerStyle: {
          backgroundColor: '#EAF8E6',
          paddingTop: 24,
          paddingHorizontal: 20,
          paddingBottom: 40,
          marginBottom: 30,
          minHeight: 120,
          borderRadius: 20,
        },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
];

const remindersSections: Section[] = [
  {
    title: '🌱 Reminders',
    data: [
      {
        key: 'banana',
        label: 'Banana',
        expDate: 'Expires 9/14/2025',
        containerStyle: { backgroundColor: '#B4E197' },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
  {
    data: [
      {
        key: 'apple',
        label: 'Apple',
        expDate: 'Expires 9/20/2025',
        containerStyle: { backgroundColor: '#A0D995' },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
  {
    data: [
      {
        key: 'orange',
        label: 'Orange',
        expDate: 'Expires 9/21/2025',
        containerStyle: { backgroundColor: '#83BD75' },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
];

const foodWaste: Section[] = [
  {
    title: '🌱 Food Waste',
    data: [
      {
        key: 'apple-fw',
        label: 'You saved 3 pieces of food from being wasted this week! 🍏',
        containerStyle: {
          backgroundColor: '#EAF8E6',
          paddingVertical: 24,
          paddingHorizontal: 20,
          minHeight: 100,
          borderRadius: 20,
        },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
];

const costs: Section[] = [
  {
    title: '🌱 Costs',
    data: [
      {
        key: 'apple-cost',
        label: 'You saved $10.00 on food this week! 💰',
        containerStyle: {
          backgroundColor: '#EAF8E6',
          paddingVertical: 24,
          paddingHorizontal: 20,
          minHeight: 100,
          borderRadius: 20,
        },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
];
// Sections combined

const sections: Section[] = [...remindersSections, ...foodWaste, ...costs, ...recommendations];

// --- Community Layout ---
function CommunityLayout({ navigation }: { navigation: any }) {
  const [currentDate, setCurrentDate] = useState('');

  // Update date every minute
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      setCurrentDate(formatted);
    };
    updateDate();
    const interval = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item, section }: { item: Item; section: Section }) => {
    const isReminderOrUntitled = section.title?.includes('Reminders') || !section.title;
    const isClickable = section.title?.includes('Food Waste') || section.title?.includes('Costs') || section.title?.includes('Inventory Recommendations');

    const Content = (
      <View
        style={[
          styles.item,
          item.containerStyle,
          isReminderOrUntitled && { height: 60 },
        ]}
      >
        <View style={styles.rowBetween}>
          <Text
            style={[
              styles.title,
              item.textStyle,
              isReminderOrUntitled && { fontSize: 16 },
            ]}
          >
            {item.label}
          </Text>

          {item.expDate && (
            <Text
              style={[
                styles.title,
                item.textStyle,
                styles.expDate,
                isReminderOrUntitled && { fontSize: 12 },
              ]}
            >
              {item.expDate}
            </Text>
          )}

          {isClickable && (
            <MaterialIcons
              name="arrow-forward-ios"
              size={20}
              color="#2C6E49"
              style={[styles.arrowIcon, { marginLeft: -5 }]}
            />
          )}
        </View>
      </View>
    );

    if (isClickable) {
      return (
        <TouchableOpacity
          onPress={() => {
            if (section.title?.includes('Food Waste')) navigation.navigate('Dashboard');
            else if (section.title?.includes('Costs')) navigation.navigate('DashboardCosts');
            else if (section.title?.includes('Inventory Recommendations')) navigation.navigate('Recommendations');
          }}
          activeOpacity={0.7}
        >
          {Content}
        </TouchableOpacity>
      );
    }

    return Content;
  };

  const renderSectionHeader = ({ section: { title } }: { section: Section }) =>
    title ? <Text style={styles.header}>{title}</Text> : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Current Date */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderText}>{currentDate}</Text>
      </View>

      <View style={styles.divider} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        style={styles.list}
        stickySectionHeadersEnabled={true}
      />
      <ExpoStatusBar style="dark" />
    </SafeAreaView>
  );
}

// --- Navigation Root ---
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Community"
        component={CommunityLayout}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DashboardCosts"
        component={DashboardCosts}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Recommendations"
        component={RecipeRecommendations}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8E6',
    paddingHorizontal: 10,
  },
  dashboardContainer: {
    alignItems: 'center',
    backgroundColor: '#EAF8E6',
    padding: 20,
  },
  dashboardTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    color: '#2C6E49',
  },
  dashboardImageLarge: {
    width: '95%',
    height: 350,
    resizeMode: 'contain',
    borderColor: '#A0D995',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 30,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C6E49',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EAF8E6',
    textAlign: 'center',
  },
  sectionSeparator: {
    height: 8,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expDate: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  arrowIcon: {
    marginLeft: 3,
    alignSelf: 'center',
  },
  topHeader: {
    paddingVertical: 10,
    marginBottom: -2,
  },
  topHeaderText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#105b21ff',
    textAlign: 'center',
  },
  divider: {
    height: 3,
    backgroundColor: '#91b399ff',
    marginVertical: 8,
  },
});
