import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Example Dashboard screen (replace with your real one)
function Dashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2C6E49' }}>
        Dashboard Screen
      </Text>
    </SafeAreaView>
  );
}

// --- Add new DashboardCosts screen ---
function DashboardCosts() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2C6E49' }}>
        Dashboard - Costs
      </Text>
    </SafeAreaView>
  );
}


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
const remindersSections: Section[] = [
  {
    title: '🌱 Reminders',
    data: [
      {
        key: 'banana',
        label: 'Banana',
        expDate: '2024-10-05',
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
        expDate: '2024-10-05',
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
        expDate: '2024-10-05',
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
        label: 'You saved 5 apples from food waste this week! 🍏',
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
        label: 'You saved $10.00 on apples this week! 💰',
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

// Merge all into one SectionList
const sections: Section[] = [
  ...remindersSections,
  ...foodWaste,
  ...costs,
];

function CommunityLayout({ navigation }: { navigation: any }) {
  const renderItem = ({ item, section }: { item: Item; section: Section }) => {
    const isReminderOrUntitled = section.title === 'Reminders' || !section.title;
    const showArrow = section.title === 'Food Waste' || section.title === 'Costs';
    const isClickable = section.title === 'Food Waste' || section.title === 'Costs';

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

          {showArrow && (
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
        if (section.title === 'Food Waste') {
          navigation.navigate('Dashboard');
        } else if (section.title === 'Costs') {
          navigation.navigate('DashboardCosts');
        }
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
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="DashboardCosts"
        component={DashboardCosts}
        options={{ title: 'Costs Dashboard' }}
      />
    </Stack.Navigator>
  );
}


// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8E6',
    paddingHorizontal: 10,
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
    paddingTop: 20,
    padding: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C6E49',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EAF8E6',
    textAlign: "center",
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
});
