import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const remindersSections: Section[] = [
  {
    title: 'Reminders',
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
        textStyle: { color: '#fff' },
      },
    ],
  },
];

const otherSections: Section[] = [
  {
    title: 'Food Waste',
    data: [
      {
        key: 'apple-fw',
        label: 'You saved 5 apples from food waste this week! 🍏',
        containerStyle: { backgroundColor: '#EAF8E6' },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
  {
    title: 'Costs',
    data: [
      {
        key: 'apple-cost',
        label: 'You saved $10.00 on apples this week! 💰',
        containerStyle: { backgroundColor: '#EAF8E6' },
        textStyle: { color: '#2C6E49' },
      },
    ],
  },
];

export default function CommunityLayout() {
  const renderItem = ({ item, section }: { item: Item; section: Section }) => {
    const isReminderOrUntitled = section.title === 'Reminders' || !section.title;

    return (
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
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: Section }) =>
    title ? <Text style={styles.header}>{title}</Text> : null;

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={remindersSections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        style={styles.list}
      />

      <View style={styles.spacer} />

      <SectionList
        sections={otherSections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        style={styles.list}
      />

      <ExpoStatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8E6', // Soft eco-friendly green
    paddingHorizontal: 10,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',

    // Soft shadow for "floating" card look
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
  spacer: {
    height: 30,
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
});
