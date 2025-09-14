import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { getItems, Item } from "../../../services/items";
import { supabase } from "../../../supabaseClient";

const numColumns = 4;
const cardMargin = 12;
const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

// Helper function: return color based on expiration
function getCardColor(exp_date: string | null) {
  if (!exp_date) return "#6EBD6D"; // default green for unknown expiry

  const today = new Date();
  const exp = new Date(exp_date);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) return "#FF4C4C";      // red
  if (diffDays <= 5) return "#FF8C42";      // orange
  if (diffDays <= 10) return "#FFD700";     // yellow
  if (diffDays <= 20) return "#B4E197";     // light green
  return "#3CA55C";                         // lighter dark green
}

function ItemCard({
  name,
  uri,
  exp_date,
}: {
  name: string;
  uri: string;
  exp_date: string | null;
}) {
  const color = getCardColor(exp_date);

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Image source={{ uri }} style={styles.image} />
      <Text style={styles.cardText}>{name}</Text>
      {exp_date && <Text style={styles.expiryText}>Expires: {exp_date}</Text>}
    </View>
  );
}

export default function Index() {
  const isFocused = useIsFocused();
  const [viewMode, setViewMode] = useState<"S" | "F" | "R">("S");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          console.error("No logged-in user found", error);
          return;
        }

        const user_uuid = data.user.id;
        const fetchedItems = await getItems(user_uuid);
        setItems(fetchedItems);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchItems();
    }
  }, [isFocused]);

  // Filter by location
  const filteredItems = items.filter(
    (item) => item.storage_location === viewMode
  );

  // Sort by expiration date: earliest expiring first
  const sortedItems = filteredItems.sort((a, b) => {
    if (!a.estimated_expiration) return 1;
    if (!b.estimated_expiration) return -1;
    return (
      new Date(a.estimated_expiration).getTime() -
      new Date(b.estimated_expiration).getTime()
    );
  });

  // Break into rows
  const rows = [];
  for (let i = 0; i < sortedItems.length; i += numColumns) {
    rows.push(sortedItems.slice(i, i + numColumns));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF8E6" />
      <Text style={styles.header}>🌱 Inventory</Text>

      <View style={styles.toggleContainer}>
        {(["S", "R", "F"] as const).map((mode) => (
          <Text
            key={mode}
            style={[
              styles.toggleButton,
              viewMode === mode && styles.activeToggleButton,
            ]}
            onPress={() => setViewMode(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        ))}
      </View>

      <View
        style={[
          styles.shelfArea,
          viewMode === "R" && styles.fridgeBackground,
          viewMode === "F" && [
            styles.fridgeBackground,
            styles.freezerGlowContainer,
          ],
        ]}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2C6E49" />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(_, index) => `row-${index}`}
            renderItem={({ item: rowItems }) => (
              <View style={styles.shelfRow}>
                {rowItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    name={item.name}
                    exp_date={item.estimated_expiration || null}
                    uri="https://placekitten.com/200/200"
                  />
                ))}
                <View
                  style={[
                    styles.shelfLine,
                    viewMode === "R" && { backgroundColor: "#e4fdf4ff" },
                    viewMode === "F" && { backgroundColor: "#e4fdf4ff" },
                  ]}
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF8E6",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 40 : 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-medium",
    paddingTop: 40,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: -10,
  },
  shelfRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: cardMargin,
    paddingTop: 20,
    position: "relative",
  },
  card: {
    width: imageSize,
    marginHorizontal: cardMargin / 2,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: imageSize,
    resizeMode: "cover",
  },
  cardText: {
    textAlign: "center",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    paddingVertical: 4,
  },
  expiryText: {
    textAlign: "center",
    fontSize: 10,
    color: "#FFFFFF",
    fontStyle: "italic",
    marginBottom: 4,
  },
  shelfLine: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: "#792525ff",
    borderRadius: 2,
    zIndex: -1,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  toggleButton: {
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2C6E49",
    color: "#2C6E49",
    fontWeight: "600",
  },
  activeToggleButton: {
    backgroundColor: "#2C6E49",
    color: "#FFFFFF",
  },
  shelfArea: {
    flex: 1,
  },
  fridgeBackground: {
    backgroundColor: "#abcdbcff",
    borderWidth: 2,
    borderColor: "#ffffffff",
    borderRadius: 18,
  },
  freezerGlowContainer: {
    borderWidth: 2,
    borderColor: "#98eef0ff",
    shadowColor: "#8de4faff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 18,
    margin: 4,
  },
});
