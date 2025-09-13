import { SafeAreaView, Text, StyleSheet } from "react-native";

export default function DashboardCost() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Dashboard Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold", color: "#2C6E49" },
});
