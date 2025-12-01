import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useGetCategoryChildrenQuery } from "../../redux/api/apiSlice";

function SubCategoriesScreen({ route, navigation }) {
  const { parentId } = route.params;
  const { data, isLoading, isError } = useGetCategoryChildrenQuery(parentId);

  if (isLoading) return <Text style={styles.loading}>Loading...</Text>;
  if (isError) return <Text style={styles.error}>Failed to load subcategories</Text>;

  const children = data || [];

  // If no child categories → go directly to job list
  if (children.length === 0) {
    navigation.replace("CategoryJobs", { categoryId: parentId });
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Job Roles</Text>

      <View style={styles.grid}>
        {children.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("CategoryJobs", { categoryId: item._id })
            }
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default SubCategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 20,
  },

  loading: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#999",
  },

  error: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "red",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1C",
    textAlign: "center",
  },
});
