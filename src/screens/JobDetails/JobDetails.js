import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetJobByIdQuery, useApplyJobMutation, useGetSavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from "../../redux/api/apiSlice";
import useAuth from '../../hooks/useAuth';

const baseUrl = 'http://10.0.2.2:5000';
const getFullLogoUrl = (logoPath) => {
  if (!logoPath) return 'file:///mnt/data/Start.jpg';
  if (typeof logoPath !== 'string') return 'file:///mnt/data/Start.jpg';
  if (logoPath.startsWith('http') || logoPath.startsWith('file')) return logoPath;
  return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

const JobDetailsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;

  const { data: job, isLoading, isError, error, refetch } = useGetJobByIdQuery(jobId);
  const { data: savedData } = useGetSavedJobsQuery();
  const [saveJob, { isLoading: isSaving }] = useSaveJobMutation();
  const [unsaveJob, { isLoading: isUnSaving }] = useUnsaveJobMutation();
  const [applyJob, { isLoading: isApplying }] = useApplyJobMutation();
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();

  const [activeTab, setActiveTab] = useState("Requirement");

  const handleApplyJob = async () => {
    if (role === 'employer') {
      Alert.alert('Not allowed', 'Employers cannot apply for jobs');
      return;
    }
    try {
      await applyJob(jobId).unwrap();
      // Navigate to success screen and pass the job title
      navigation.navigate("ApplySuccess", { roleName: job?.title || "Job" });
    } catch (err) {
      
      const message = err?.data?.message || err?.message || 'Failed to apply for the job';
      Alert.alert('Error', message);
    }
  };

  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E5AAC" />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading job details...</Text>
      </View>
    );

  if (isError || !job) {
    const message = error?.data?.message || error?.message || "Failed to load job details.";
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 12, textAlign: 'center' }}>{message}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => refetch()} style={[styles.applyBtn, { paddingHorizontal: 20 }]}>
            <Text style={styles.applyBtnText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.applyBtn, { backgroundColor: '#CCCCCC', paddingHorizontal: 20 }]}>
            <Text style={[styles.applyBtnText, { color: '#222' }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ------------------ HEADER SECTION ------------------ */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={async () => {
          try {
            // find saved entry
            const savedEntry = Array.isArray(savedData?.savedJobs) ? savedData.savedJobs.find((s) => s.jobId === (job._id || job.id)) : null;
            if (savedEntry) {
              // Backend expects a jobId in the route; send jobId to unsave
              await unsaveJob(savedEntry.jobId || savedEntry.savedId).unwrap();
            } else {
              await saveJob(job._id || job.id).unwrap();
            }
          } catch (err) {
            const message = err?.data?.message || err?.message || 'Failed to toggle saved job';
            Alert.alert('Error', message);
          }
        }}>
          { (isSaving || isUnSaving) ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name={Array.isArray(savedData?.savedJobs) && savedData.savedJobs.find((s) => s.jobId === (job._id || job.id)) ? "bookmark" : "bookmark-outline"} size={26} color="#fff" />
          ) }
        </TouchableOpacity>

        {/* Company Logo */}
        <Image
          source={{ uri: getFullLogoUrl(job?.employerId?.companyLogo) }}
          style={styles.companyLogo}
        />

        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.companyName}>{job.employerId.companyName}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{job.categoryId?.name}</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>{job.jobType}</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>Junior</Text></View>
        </View>

        <View style={styles.salaryRow}>
          <Text style={styles.salaryText}>
            ₹{job.salaryRange.min.toLocaleString()} - ₹{job.salaryRange.max.toLocaleString()}
          </Text>
          <Text style={styles.locationText}>{job.location}</Text>
        </View>
      </View>

      {/* ------------------ TABS ------------------ */}
      <View style={styles.tabRow}>
        {["Description", "Requirement", "About", "Reviews"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ------------------ TAB CONTENT ------------------ */}
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        {activeTab === "Description" && (
          <Text style={styles.contentText}>{job.description}</Text>
        )}

        {activeTab === "Requirement" && (
          <View>
            {job.responsibilities.map((item, index) => (
              <Text key={index} style={styles.bulletItem}>• {item}</Text>
            ))}
          </View>
        )}

        {activeTab === "About" && (
          <Text style={styles.contentText}>{job.employerId.companyProfile}</Text>
        )}

        {activeTab === "Reviews" && (
          <Text style={styles.contentText}>No reviews available</Text>
        )}
      </View>

      {/* ------------------ APPLY BUTTON ------------------ */}
      {role !== 'employer' && (
        <TouchableOpacity
          style={[styles.applyBtn, isApplying && { opacity: 0.7 }]}
          onPress={handleApplyJob}
          disabled={isApplying}
        >
          {isApplying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.applyBtnText}>Apply Now</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default JobDetailsScreen;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#2E5AAC",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  companyLogo: {
    width: 90,
    height: 90,
    borderRadius: 50,
    alignSelf: "center",
    marginVertical: 20,
  },
  jobTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  companyName: {
    fontSize: 16,
    color: "#E6E6E6",
    textAlign: "center",
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 10,
  },
  badge: {
    backgroundColor: "#ffffff44",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
  },
  salaryRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  salaryText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  locationText: {
    fontSize: 16,
    color: "#fff",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  tabText: {
    fontSize: 16,
    color: "#999",
    paddingBottom: 8,
  },
  tabActive: {
    color: "#000",
    borderBottomWidth: 2,
    borderBottomColor: "#2E5AAC",
  },
  bulletItem: {
    fontSize: 15,
    marginVertical: 6,
    color: "#555",
  },
  contentText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  applyBtn: {
    backgroundColor: "#2E5AAC",
    marginHorizontal: 20,
    marginVertical: 25,
    paddingVertical: 15,
    borderRadius: 15,
  },
  applyBtnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
