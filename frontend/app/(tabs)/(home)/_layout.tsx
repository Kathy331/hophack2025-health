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

// ✅ Split your sections into two groups
const remindersSections: Section[] = [
  {
    title: 'Reminders',
    data: [
      {
        key: 'banana',
        label: 'Banana',
        expDate: '2024-10-05',
        containerStyle: { backgroundColor: '#f4d35e' },
        textStyle: { color: '#000' },
      },
    ],
  },
  {
    data: [
      {
        key: 'apple',
        label: 'Apple',
        expDate: '2024-10-05',
        containerStyle: { backgroundColor: '#f4d35e' },
        textStyle: { color: '#000' },
      },
    ],
  },
  {
    data: [
      {
        key: 'orange',
        label: 'Orange',
        expDate: '2024-10-05',
        containerStyle: { backgroundColor: '#f4d35e' },
        textStyle: { color: '#000' },
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
        label: 'You saved 5 apples from food waste this week!',
        containerStyle: { backgroundColor: '#fff' },
        textStyle: { color: '#000' },
      },
    ],
  },
  {
    title: 'Costs',
    data: [
      {
        key: 'apple-cost',
        label: 'You saved $10.00 on apples this week!',
        containerStyle: { backgroundColor: '#fff' },
        textStyle: { color: '#000' },
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
      {/* ✅ First SectionList for Reminders */}
      <SectionList
        sections={remindersSections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        style={styles.list}
      />

      {/* ✅ Spacer between the two lists */}
      <View style={styles.spacer} />

      {/* ✅ Second SectionList for Food Waste and Costs */}
      <SectionList
        sections={otherSections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        style={styles.list}
      />

      <ExpoStatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edebebff',
  },
  item: {
    height: 150,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#3c7746ff',
  },
  title: {
    fontSize: 20,
    color: '#eaeaeaff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sectionSeparator: {
    height: 5,
  },
  list: {
    flexGrow: 0, // so each list sizes to its content
  },
  listContent: {
    paddingBottom: 10,
  },
  spacer: {
    height: 40, // 👈 adjust this space between the two lists
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expDate: {
    fontSize: 14,
    color: '#473507ff',
  },
});
