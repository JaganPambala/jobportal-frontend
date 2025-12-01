import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function ApplySuccessScreen({ navigation, route }) {
  const { roleName = "Job" } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Illustration */}
      <Image
        source= {{ uri: "file:///mnt/data/Set A1.jpg" }} // <-- Add your illustration here
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Successful</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        You’ve successfully applied to {roleName}.
      </Text>

      {/* Track Button */}
      <TouchableOpacity
        style={styles.trackBtn}
        onPress={() => navigation.navigate("Applications")}
      >
        <Text style={styles.trackBtnText}>Track</Text>
      </TouchableOpacity>

      {/* Browse Jobs */}
      <TouchableOpacity
        style={styles.browseBtn}
        onPress={() => navigation.navigate("JobsList")}
      >
        <Text style={styles.browseText}>Browse Jobs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FB",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 90,
  },

  image: {
    width: 260,
    height: 260,
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0E1630",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#7B7F87",
    lineHeight: 22,
    marginBottom: 40,
  },

  trackBtn: {
    width: "100%",
    backgroundColor: "#2E5AAC",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },

  trackBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  browseBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2E5AAC",
    alignItems: "center",
  },

  browseText: {
    color: "#2E5AAC",
    fontSize: 18,
    fontWeight: "700",
  },
});
