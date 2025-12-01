// EmployerDashboard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function EmployerDashboard({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome Employer 👋</Text>
      <Text style={styles.subtitle}>Manage & post jobs easily</Text>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("PostJob")}
        >
          <Ionicons name="add-circle" size={32} color="#2E5AAC" />
          <Text style={styles.actionText}>Post Job</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("ManageJobs")}
        >
          <MaterialIcons name="work-outline" size={32} color="#2E5AAC" />
          <Text style={styles.actionText}>Manage Jobs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("ManageJobs")}
        >
          <Ionicons name="people-outline" size={32} color="#2E5AAC" />
          <Text style={styles.actionText}>View Applicants</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("EmployerProfile")}
        >
          <Ionicons name="business-outline" size={32} color="#2E5AAC" />
          <Text style={styles.actionText}>Company Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Section: Recent Posted Jobs */}
      <Text style={styles.sectionHeader}>Recent Job Posts</Text>

      {/* Example placeholder card */}
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>Full-Stack Developer</Text>
        <Text style={styles.jobMeta}>Hyderabad • ₹8L - ₹12L</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ManageJobs")}>
          <Text style={styles.viewMore}>View Applicants →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>React Native Developer</Text>
        <Text style={styles.jobMeta}>Remote • ₹6L - ₹10L</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ManageJobs")}>
          <Text style={styles.viewMore}>View Applicants →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8F8FB" },
  title: { fontSize: 26, fontWeight: "800", color: "#111" },
  subtitle: { color: "#6C7A92", marginBottom: 20 },

  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },

  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
  },
  actionText: { marginTop: 8, fontWeight: "700", color: "#333" },

  sectionHeader: { fontSize: 18, fontWeight: "700", marginVertical: 14 },

  jobCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  jobTitle: { fontWeight: "700", fontSize: 16, color: "#111" },
  jobMeta: { color: "#6C7A92", marginTop: 6 },
  viewMore: { marginTop: 8, color: "#2E5AAC", fontWeight: "600" },
});
