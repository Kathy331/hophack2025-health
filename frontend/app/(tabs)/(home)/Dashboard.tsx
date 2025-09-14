import { SafeAreaView, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { getFoodStats } from "../../../services/foodStatsService";

export default function Dashboard() {
  const [stats, setStats] = useState({ weekly: 0, lifetime: 0 });

  useEffect(() => {
    async function fetchStats() {
      const data = await getFoodStats();
      setStats(data);
    }

    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Dashboard Screen</Text>
      <Text style={styles.text}>Weekly Savings: {stats.weekly} kg</Text>
      <Text style={styles.text}>Lifetime Savings: {stats.lifetime} kg</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold", color: "#2C6E49" },
});
