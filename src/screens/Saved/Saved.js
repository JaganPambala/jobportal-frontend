import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";

const STATUS_COLORS = {
  Applied: { bg: "#E6EEFF", text: "#3B6EFF" },
  Viewed: { bg: "#FFF6D9", text: "#F1A500" },
  Shortlisted: { bg: "#E8FFE8", text: "#2ECC71" },
  Rejected: { bg: "#FFE6E6", text: "#FF4E4E" },
};

import { useGetSavedJobsQuery, useUnsaveJobMutation } from '../../redux/api/apiSlice';

export default function SavedJobsScreen() {
  const { data: savedRes, isLoading, isError, refetch } = useGetSavedJobsQuery();
  const [unsaveJob] = useUnsaveJobMutation();

  const renderCard = ({ item, onUnsave }) => {
    const statusStyle = STATUS_COLORS[item.applicationStatus] || {
      bg: "#EEE",
      text: "#333",
    };

    return (
      <View style={styles.card}>
        {/* Top Row */}
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: "http://10.0.2.2:5000" + item.companyLogo }}
            style={styles.logo}
          />

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
            <Text style={styles.company}>{item.companyName}</Text>
          </View>

          <Text style={styles.salary}>
            ₹{item.salaryRange.min.toLocaleString()}/y
          </Text>
        </View>

        {/* Bottom Row */}
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: statusStyle.bg },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.applicationStatus}
            </Text>
          </View>

          <Text style={styles.jobType}>{item.jobType}</Text>
          <TouchableOpacity onPress={() => onUnsave(item.savedId)} style={{ marginLeft: 12 }}>
            <Text style={{ color: '#E23B3B', fontWeight: '700' }}>Unsave</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const onUnsave = async (savedIdOrJobId) => {
    try {
      // Backend expects a jobId as the param so prefer jobId but accept savedId fallback
      // Find jobId from saved jobs if savedId passed
      let jobIdToSend = savedIdOrJobId;
      const found = (savedRes?.savedJobs || []).find((s) => s.savedId === savedIdOrJobId);
      if (found && found.jobId) jobIdToSend = found.jobId;
      await unsaveJob(jobIdToSend).unwrap();
    } catch (err) {
      console.log('Failed to unsave', err);
    }
  };

  const savedJobs = savedRes?.savedJobs || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.heading}>
        You saved {savedJobs.length} Jobs 👍
      </Text>

      {/* Saved Job List */}
      {savedJobs.length === 0 ? (
        <View style={{ padding: 20 }}><Text style={{ color: '#666' }}>No saved jobs yet.</Text></View>
      ) : (
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.savedId}
        renderItem={({ item }) => renderCard({ item, onUnsave })}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111",
  },

  card: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 45,
    height: 45,
    borderRadius: 30,
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  company: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },

  salary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  jobType: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
});
