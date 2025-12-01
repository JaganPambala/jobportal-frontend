import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useGetEmployerJobsQuery, useSetJobActivationMutation, useDeleteJobMutation } from "../../redux/api/apiSlice";
import { Switch, ActivityIndicator } from 'react-native';
import { useState } from 'react';

export default function ManageJobsScreen({ navigation }) {
  const { data, isLoading, isError } = useGetEmployerJobsQuery();
  const [setJobActivation, { isLoading: isActivating }] = useSetJobActivationMutation();
  const [activatingJobId, setActivatingJobId] = useState(null);
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [deletingJobId, setDeletingJobId] = useState(null);

  if (isLoading) return <Text style={styles.loading}>Loading jobs...</Text>;
  if (isError) return <Text style={styles.error}>Failed to load jobs</Text>;

  const jobs = data?.jobs || [];

  const handleDelete = (jobId) => {
    Alert.alert("Delete Job", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: 'cancel' },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            setDeletingJobId(jobId);
            await deleteJob(jobId).unwrap();
            Alert.alert('Success', 'Job deleted (soft delete) successfully');
          } catch (err) {
            
            Alert.alert('Error', err?.data?.message || err?.message || 'Failed to delete job');
          } finally {
            setDeletingJobId(null);
          }
        }
      },
    ]);
  };

  const handleToggleActive = (jobId, currentIsActive) => {
    const action = currentIsActive ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} job`,
      `Are you sure you want to ${action} this job?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setActivatingJobId(jobId);
              await setJobActivation({ jobId, isActive: !currentIsActive }).unwrap();
              Alert.alert('Success', `Job ${action}d successfully`);
            } catch (err) {
              
              Alert.alert('Error', err?.data?.message || err?.message || 'Failed to change job status');
            } finally {
              setActivatingJobId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Jobs</Text>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
              <Image
                source={{ uri: item.companyLogo || item.employerId?.companyLogo || "https://via.placeholder.com/60" }}
                style={styles.logo}
              />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>{item.title}</Text>
              {item.companyName && <Text style={styles.sub}>{item.companyName}</Text>}
              {item.location && <Text style={styles.sub}>{item.location}</Text>}
              <Text style={styles.sub}>Applicants: {item.totalApplicants ?? item.applicantsBreakdown?.total ?? 0}</Text>
              <Text style={styles.sub}>Status: {item.status ?? (item.isActive ? "Active" : "Inactive")}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditJob", { jobId: item.id || item._id })}
              >
                <Ionicons name="create-outline" size={24} color="#2E5AAC" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deletingJobId === (item.id || item._id) ? null : handleDelete(item.id || item._id)}>
                {deletingJobId === (item.id || item._id) ? (
                  <ActivityIndicator size="small" color="#E23B3B" />
                ) : (
                  <MaterialIcons name="delete-outline" size={26} color="#E23B3B" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ApplicantsList", { jobId: item.id || item._id })}
              >
                <Ionicons name="people-outline" size={26} color="#333" />
              </TouchableOpacity>

              {/* Activation toggle */}
              {activatingJobId === (item.id || item._id) ? (
                <ActivityIndicator size="small" color="#999" />
              ) : (
                <Switch
                  value={(item.isActive ?? (item.status ? item.status === 'Active' : false))}
                  onValueChange={() => handleToggleActive(item.id || item._id, item.isActive ?? (item.status ? item.status === 'Active' : false))}
                />
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F8FB" },
  header: { fontSize: 24, fontWeight: "700", color: "#0E1630", marginBottom: 20 },
  loading: { marginTop: 40, textAlign: "center" },
  error: { marginTop: 40, textAlign: "center", color: "red" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
  },
  logo: { width: 60, height: 60, borderRadius: 8 },
  title: { fontSize: 18, fontWeight: "700", color: "#111" },
  sub: { fontSize: 13, color: "#666", marginTop: 2 },
  actions: { justifyContent: "space-between", alignItems: "center", marginLeft: 12 },
});
