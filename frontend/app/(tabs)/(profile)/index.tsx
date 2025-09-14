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

const numColumns = 3;
const cardMargin = 16;
const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - cardMargin * (numColumns + 1)) / numColumns;

function ItemCard({
  name,
  color,
  uri,
  expiration,
}: {
  name: string;
  color: string;
  uri: string;
  expiration?: string | null;
}) {
  const displayExp = expiration || "N/A";
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Image source={{ uri }} style={styles.image} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardText} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.expText}>Exp: {displayExp}</Text>
      </View>
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
          setItems([]);
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

    if (isFocused) fetchItems();
  }, [isFocused]);

  const filteredItems = items.filter(
    (item) => item.storage_location === viewMode
  );

  const rows = [];
  for (let i = 0; i < filteredItems.length; i += numColumns) {
    rows.push(filteredItems.slice(i, i + numColumns));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF8E6" />
      <Text style={styles.header}>🌱 Inventory</Text>

      {/* Toggle buttons */}
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
                    color={
                      viewMode === "S"
                        ? "#B4E197"
                        : viewMode === "R"
                        ? "#A7DAD9"
                        : "#98eef0"
                    }
                    uri="https://placekitten.com/200/200"
                    expiration={item.estimated_expiration || null}
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
    color: "#2C6E49",
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
    borderRadius: 18,
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
  cardOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  expText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginTop: 2,
  },
  shelfLine: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    height: 30,
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 20,
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
    borderWidth: 3,
    borderColor: "#ffffffff",
    borderRadius: 20,
  },
  freezerGlowContainer: {
    borderWidth: 3,
    borderColor: "#98eef0ff",
    shadowColor: "#8de4faff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    borderRadius: 20,
    margin: 5,
  },
});
