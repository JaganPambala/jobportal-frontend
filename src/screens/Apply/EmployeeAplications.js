import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetEmployeeApplicationsQuery } from '../../redux/api/apiSlice';
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_COLORS = {
  Applied: { bg: "#EAF3FF", text: "#2E5AAC" },
  Viewed: { bg: "#FFF3D9", text: "#C28400" },
  Shortlisted: { bg: "#D9F8E6", text: "#1F8A4C" },
  Rejected: { bg: "#FFE5E7", text: "#D62828" },
};

export default function ApplicationsScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build status param for API (if All, then no status filter)
  const statusParam = selectedFilter === 'All' ? undefined : selectedFilter;
  const { data, isFetching, isError, refetch } = useGetEmployeeApplicationsQuery({ page, limit, status: statusParam });

  const applications = data?.applications || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit, pages: 1 };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Applications</Text>

        <Image
          source={{
            uri:
              "https://i.pravatar.cc/100?img=5",
          }}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.title}>You have</Text>
      <Text style={styles.count}>{pagination.total ?? applications.length} Applications 👍</Text>

      {/* FILTER BUTTONS */}
      <View style={styles.filterRow}>
        {["All", "Applied", "Viewed", "Shortlisted", "Rejected"].map(
          (filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterBtn,
                selectedFilter === filter && styles.filterActive,
              ]}
              onPress={() => { setSelectedFilter(filter); setPage(1); }}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* LIST */}
      {isFetching ? (
        <View style={{ padding: 20 }}><Text>Loading applications...</Text></View>
      ) : null}
      <FlatList
        data={applications}
        keyExtractor={(item) => item.applicationId || item._id}
        contentContainerStyle={{ paddingTop: 10 }}
        refreshing={isFetching}
        onRefresh={() => refetch()}
        renderItem={({ item }) => {
          const badge = STATUS_COLORS[item.applicationStatus] || STATUS_COLORS['Applied'];

          return (
            <View style={styles.card}>
                <Image source={{ uri: item.companyLogo }} style={styles.logo} />

              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                <Text style={styles.company}>{item.companyName}</Text>
                {item.appliedAt ? (
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 6 }}>Applied: {new Date(item.appliedAt).toLocaleString()}</Text>
                ) : null}

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badge.bg },
                  ]}
                >
                      <Text style={[styles.badgeText, { color: badge.text }]}>
                        {item.applicationStatus}
                      </Text>
                </View>
              </View>

              <View style={styles.rightSide}>
                <Text style={styles.salary}>{item.salaryRange ? `₹${item.salaryRange?.min?.toLocaleString()} - ₹${item.salaryRange?.max?.toLocaleString()}` : item.salary || ''}</Text>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.type}>{item.jobType}</Text>
              </View>
            </View>
          );
        }}
      />
      {applications.length === 0 && !isFetching ? (
        <View style={{ padding: 20 }}><Text>No applications found.</Text></View>
      ) : null}
      {/* PAGINATION */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
        <TouchableOpacity disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))} style={{ opacity: page <= 1 ? 0.6 : 1 }}>
          <Text>← Prev</Text>
        </TouchableOpacity>
        <Text>Page {pagination.page} / {pagination.pages}</Text>
        <TouchableOpacity disabled={page >= pagination.pages} onPress={() => setPage((p) => Math.min(pagination.pages, p + 1))} style={{ opacity: page >= pagination.pages ? 0.6 : 1 }}>
          <Text>Next →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F8FB", padding: 16 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  avatar: { width: 40, height: 40, borderRadius: 20 },

  title: { marginTop: 20, fontSize: 26, fontWeight: "600" },
  count: { fontSize: 28, fontWeight: "800", marginBottom: 20 },

  filterRow: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E6E8EC",
  },
  filterActive: {
    backgroundColor: "#2E5AAC",
  },
  filterText: { color: "#333" },
  filterTextActive: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#00000010",
  },
  logo: { width: 45, height: 45, marginRight: 14 },

  jobTitle: { fontSize: 17, fontWeight: "700" },
  company: { color: "#666", marginBottom: 6 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontWeight: "600", fontSize: 13 },

  rightSide: { alignItems: "flex-end" },
  salary: { fontWeight: "700", fontSize: 15 },
  location: { fontSize: 13, color: "#666" },
  type: { marginTop: 4, fontSize: 13, fontWeight: "600" },
});
