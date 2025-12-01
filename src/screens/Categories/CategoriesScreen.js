import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView 
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useGetParentCategoriesQuery } from "../../redux/api/apiSlice";

export default function CategoriesScreen({ navigation }) {
  const { data, isLoading, isError } = useGetParentCategoriesQuery();

  if (isLoading) return <Text style={styles.loading}>Loading...</Text>;
  if (isError) return <Text style={styles.error}>Failed to load categories</Text>;

  const parents = data || [];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Categories</Text>

        {/* Right side placeholder for balance */}
        <View style={{ width: 26 }} />
      </View>

      {/* GRID */}
      <View style={styles.grid}>
        {parents.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("SubCategories", { parentId: item._id })
            }
          >
            <Image
              source={{
                uri: item.icon || "https://via.placeholder.com/80",
              }}
              style={styles.icon}
            />

            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

/* ------------------------ STYLES ------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 20,
  },

  loading: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },

  error: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "red",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 45,
    marginBottom: 25,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0A0A0A",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 20,

    // soft shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  icon: {
    width: 70,
    height: 70,
    marginBottom: 12,
    resizeMode: "contain",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B1B1B",
    textAlign: "center",
  },
});
