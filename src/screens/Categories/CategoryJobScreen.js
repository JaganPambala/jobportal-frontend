import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useGetJobsByCategoryQuery } from "../../redux/api/apiSlice";

const baseUrl = "http://10.0.2.2:5000";

const getFullLogoUrl = (logoPath) => {
  if (!logoPath) return "https://via.placeholder.com/45";
  if (typeof logoPath !== "string") return "https://via.placeholder.com/45";
  if (logoPath.startsWith("http") || logoPath.startsWith("data:")) return logoPath;
  if (logoPath.startsWith("/")) return `${baseUrl}${logoPath}`;
  return `${baseUrl}/${logoPath}`;
};

function CategoryJobsScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetJobsByCategoryQuery({
    categoryId,
    page,
    limit,
  });

  if (isLoading)
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );

  if (isError)
    return (
      <View style={styles.centered}>
        <Text>Failed to load jobs</Text>
      </View>
    );

  const jobs = data?.jobs || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  const featuredJobs = jobs.filter((j) => j.isFeatured === true);
  const normalJobs = jobs.filter((j) => j.isFeatured !== true);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data?.category} Jobs</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Category Card */}
      <View style={styles.categoryCard}>
        <View style={styles.categoryLogo}>
          <Text style={styles.categoryLogoText}>
            {data?.category
              ?.split(' ')
              .map((word) => word[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'JB'}
          </Text>
        </View>

        <View style={{ marginLeft: 14, flex: 1 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.jobsCount}>
              {pagination.total || jobs.length} Jobs
            </Text>
          </View>

          <Text style={styles.categoryDescription}>
            {data?.category || 'Category'} position - explore opportunities
          </Text>
        </View>
      </View>

      {/* Featured Jobs Header */}
      {featuredJobs.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Jobs ({featuredJobs.length})</Text>
        </View>
      )}

      {/* Featured Vertical Cards */}
      {featuredJobs.map((item) => (
        <TouchableOpacity
          style={styles.jobCard}
          key={item._id}
          onPress={() => navigation.navigate('JobDetails', { jobId: item._id })}
        >
          <Image
            source={{ uri: getFullLogoUrl(item.employerId?.companyLogo) }}
            style={styles.jobLogo}
          />

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobCompany}>{item.employerId?.companyName}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.jobSalary}>
              ₹{item.salaryRange.min.toLocaleString()} - ₹{item.salaryRange.max.toLocaleString()}
            </Text>
            <Text style={styles.jobLocation}>{item.location}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Normal Jobs Header */}
      {normalJobs.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>More Jobs ({normalJobs.length})</Text>
        </View>
      )}

      {/* Normal Vertical Cards */}
      {normalJobs.map((item) => (
        <TouchableOpacity
          key={item._id}
          style={styles.jobCard}
          onPress={() => navigation.navigate("JobDetails", { jobId: item._id })}
        >
          <Image
            source={{ uri: getFullLogoUrl(item.employerId?.companyLogo) }}
            style={styles.jobLogo}
          />

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobCompany}>{item.employerId?.companyName}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.jobSalary}>
              ₹{item.salaryRange.min.toLocaleString()} - ₹
              {item.salaryRange.max.toLocaleString()}
            </Text>
            <Text style={styles.jobLocation}>{item.location}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={page <= 1}
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          style={{ opacity: page <= 1 ? 0.5 : 1 }}
        >
          <Text style={styles.paginationText}>← Prev</Text>
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          Page {pagination.page} / {pagination.pages}
        </Text>

        <TouchableOpacity
          disabled={page >= pagination.pages}
          onPress={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          style={{ opacity: page >= pagination.pages ? 0.5 : 1 }}
        >
          <Text style={styles.paginationText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

export default CategoryJobsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FC",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },

  backArrow: {
    fontSize: 24,
    fontWeight: "700",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  categoryCard: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 25,
  },

  categoryLogo: {
    width: 75,
    height: 75,
    backgroundColor: "#F9D976",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryLogoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
  },
  categoryLogoSub: {
    marginTop: -4,
    fontSize: 14,
    color: "#333",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  jobsCount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2F80ED",
  },

  companyCount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#999",
  },

  categoryDescription: {
    marginTop: 6,
    lineHeight: 20,
    color: "#444",
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  seeAll: {
    color: "#999",
    fontWeight: "600",
  },

  jobCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  jobLogo: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#eee",
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  jobCompany: {
    color: "#777",
    marginTop: 3,
    fontSize: 13,
  },

  jobLocation: {
    color: "#666",
    marginTop: 3,
    fontSize: 12,
  },

  jobSalary: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2F80ED",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginTop: 20,
  },

  paginationText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
