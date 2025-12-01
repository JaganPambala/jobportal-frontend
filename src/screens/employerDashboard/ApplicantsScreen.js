import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetApplicantsForJobQuery, useUpdateApplicationStatusMutation } from "../../redux/api/apiSlice";
// debug: show exports (temporary) - removed debug logging
// import * as apiHooks from "../../redux/api/apiSlice";

export default function ApplicantsScreen({ route, navigation }) {
  const { jobId } = route.params; 
  // ApplicantsScreen for jobId
  const [processingAppId, setProcessingAppId] = React.useState(null);
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  // Debug: log exports from apiSlice and check hook presence - removed

  // NOTE: assumes useGetApplicantsForJobQuery is available from apiSlice; restart Metro if you see issues.

  const { data, isLoading, isError } = useGetApplicantsForJobQuery(jobId);
  // Applicants data fetched for job

  if (isLoading) return <Text style={styles.loading}>Loading applicants...</Text>;
  if (isError) return <Text style={styles.error}>Failed to load applicants</Text>;

  // Backend may return an array of applicant objects or a wrapper { applicants: [] }
  const applicants = Array.isArray(data) ? data : data?.applicants || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Applicants</Text>

      <FlatList
        data={applicants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.profilePic || "https://via.placeholder.com/60" }}
              style={styles.avatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.employeeId?.fullName || 'Candidate'}</Text>
              <Text style={styles.email}>{item.employeeId?.email || ''}</Text>
              {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.status}>Status: {item.status}</Text>
                <View style={[styles.badge, item.status === 'Shortlisted' ? styles.badgeGreen : item.status === 'Rejected' ? styles.badgeRed : item.status === 'Viewed' ? styles.badgeBlue : styles.badgeGray]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              {item.appliedAt ? (
                <Text style={styles.appliedAt}>Applied: {new Date(item.appliedAt).toLocaleString()}</Text>
              ) : null}
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                onPress={() => {
                  try {
                    if (item.status !== 'Viewed') {
                      // fire-and-forget mutation, optimistic update occurs in onQueryStarted
                      updateApplicationStatus({ applicationId: item._id, jobId, status: 'Viewed' }).catch((err) => {
                        
                        Alert.alert('Error', err?.data?.message || err?.message || 'Failed to update status');
                      });
                    }
                    navigation.navigate("EmployeeProfile", { id: item.employeeId?._id });
                  } catch (err) {
                    
                    Alert.alert('Error', err?.data?.message || err?.message || 'Failed to update status');
                  }
                }}
              >
                {processingAppId === item._id ? (
                  <ActivityIndicator size="small" color="#2E5AAC" />
                ) : (
                  <Ionicons name="eye-outline" size={24} color="#2E5AAC" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Shortlist', 'Shortlist this applicant?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Confirm',
                            onPress: async () => {
                        try {
                          setProcessingAppId(item._id);
                                if (item.status === 'Shortlisted') {
                                  Alert.alert('Info', 'Applicant is already shortlisted');
                                } else {
                                  await updateApplicationStatus({ applicationId: item._id, jobId, status: 'Shortlisted' }).unwrap();
                                  Alert.alert('Success', 'Applicant shortlisted');
                                }
                          Alert.alert('Success', 'Applicant shortlisted');
                        } catch (err) {
                          
                          Alert.alert('Error', err?.data?.message || err?.message || 'Failed to update status');
                        } finally {
                          setProcessingAppId(null);
                        }
                      },
                    },
                  ]);
                }}
              >
                {processingAppId === item._id ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <Ionicons name="checkmark-circle-outline" size={26} color="#4CAF50" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Reject', 'Reject this application?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Confirm',
                      onPress: async () => {
                        try {
                          setProcessingAppId(item._id);
                          if (item.status === 'Rejected') {
                            Alert.alert('Info', 'Applicant is already rejected');
                          } else {
                            await updateApplicationStatus({ applicationId: item._id, jobId, status: 'Rejected' }).unwrap();
                            Alert.alert('Success', 'Applicant rejected');
                          }
                          Alert.alert('Success', 'Applicant rejected');
                        } catch (err) {
                          
                          Alert.alert('Error', err?.data?.message || err?.message || 'Failed to update status');
                        } finally {
                          setProcessingAppId(null);
                        }
                      },
                    },
                  ]);
                }}
              >
                {processingAppId === item._id ? (
                  <ActivityIndicator size="small" color="#E23B3B" />
                ) : (
                  <Ionicons name="close-circle-outline" size={26} color="#E23B3B" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F8FB" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  loading: { marginTop: 40, textAlign: "center" },
  error: { marginTop: 40, textAlign: "center", color: "red" },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
  },
  avatar: { width: 55, height: 55, borderRadius: 30 },
  name: { fontSize: 17, fontWeight: "700", color: "#111" },
  email: { fontSize: 13, color: "#666" },
  status: { marginTop: 4, fontSize: 13, color: "#444" },
  message: { marginTop: 4, fontSize: 13, color: "#555" },
  appliedAt: { fontSize: 12, color: "#888", marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginLeft: 6 },
  badgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  badgeGreen: { backgroundColor: '#4CAF50' },
  badgeRed: { backgroundColor: '#E23B3B' },
  badgeBlue: { backgroundColor: '#2E5AAC' },
  badgeGray: { backgroundColor: '#666' },

  buttons: {
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 12,
  },
});
