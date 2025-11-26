import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const categoriesPopular = [
  { id: 1, title: "UX Designer", image: "" },
  { id: 2, title: "Web Developer", image: "" },
  { id: 3, title: "Software Engineer", image: "" },
  { id: 4, title: "Product Manager", image: "" },
];

const categoriesTrending = [
  { id: 5, title: "Accountant", image: "" },
  { id: 6, title: "Marketing", image: "" },
  { id: 7, title: "App Developer", image: "" },
  { id: 8, title: "Graphic Designer", image: "" },
];

 function CategoriesScreen({ navigation }) {
  const renderCategory = (item) => (
    <TouchableOpacity key={item.id} style={styles.card}>
      <Image  source={{ uri: "file:///mnt/data/Start.jpg" }} />
       
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() =>navigation.replace("Home") }>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Categories</Text>

        <View style={{ width: 26 }} /> 
      </View>

      {/* Popular */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>

      <View style={styles.grid}>
        {categoriesPopular.map(renderCategory)}
      </View>

      {/* Trending */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>

      <View style={styles.grid}>
        {categoriesTrending.map(renderCategory)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  sectionHeader: { 
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 1,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    resizeMode: "contain",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default CategoriesScreen;    