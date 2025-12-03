import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetCategoryRolesQuery, useUpdateJobPreferencesMutation } from '../../redux/api/apiSlice';

const JobPreferencesScreen = ({ navigation }) => {
  // Selected State (store role ids here to send to backend)
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("USA");
  const [jobType, setJobType] = useState("Any");
  const [officeType, setOfficeType] = useState("Any");

  // Mutation for updating job preferences
  const [updateJobPreferences, { isLoading: isUpdating, isError: updateError }] = useUpdateJobPreferencesMutation();

  // Options
  const { data: rolesData, isLoading: rolesLoading, isError: rolesError } = useGetCategoryRolesQuery();
  

  const fallbackRoles = [
    "Product Designer",
    "Motion Designer",
    "UX Designer",
    "Graphics Designer",
    "Full-Stack Developer",
    "Developer",
  ];

  // Normalize roles into objects { id, name } so UI and selection logic are consistent
  const jobRoles = Array.isArray(rolesData) && rolesData.length
    ? rolesData.map((r) => ({
        id: String(r._id || r.id || r.value || r.key || r), // prefer _id
        name: String(r.name || r.title || r.label || r.role || r),
      }))
    : fallbackRoles.map((r) => ({ id: String(r), name: r }));

  const locations = ["Worldwide", "USA", "California", "San Jose", "New York", "Seattle"];
  const jobTypes = ["Any", "Full-Time", "Part-Time"];
  const officeTypes = ["Any", "On-Site", "Remote"];

  const toggleRole = (roleId) => {
    
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles((s) => s.filter((item) => item !== roleId));
    } else {
      setSelectedRoles((s) => [...s, roleId]);
    }
  };

  const savePreferences = async () => {
    const data = {
      selectedRoles,
      selectedLocation,
      jobType,
      officeType,
    }; 
    

    try {
      const response = await updateJobPreferences(data).unwrap();
      
      // After saving preferences, send user to the app Home (Employee stack)
      // Using replace to clear the onboarding/preferences flow from the stack
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('Employee');
      } else if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Employee');
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
      // Optionally show error to user
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace("Employee") }>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Job Preferences</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Job Roles */}
      <Text style={styles.sectionTitle}>Select Job Roles</Text>
      {rolesLoading && <Text style={{ marginBottom: 8 }}>Loading roles...</Text>}
      {rolesError && <Text style={{ marginBottom: 8, color: '#ff3b30' }}>Failed to load roles — showing defaults.</Text>}
      <View style={styles.chipContainer}>
        {jobRoles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.chip,
              selectedRoles.includes(role.id) && styles.chipSelected,
            ]}
            onPress={() => toggleRole(role.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedRoles.includes(role.id) && styles.chipTextSelected,
              ]}
            >
              {role.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location */}
      <Text style={styles.sectionTitle}>Select Location</Text>
      <View style={styles.chipContainer}>
        {locations.map((loc) => (
          <TouchableOpacity
            key={loc}
            style={[styles.chip, selectedLocation === loc && styles.chipSelected]}
            onPress={() => setSelectedLocation(loc)}
          >
            <Text
              style={[
                styles.chipText,
                selectedLocation === loc && styles.chipTextSelected,
              ]}
            >
              {loc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Job Type */}
      <Text style={styles.sectionTitle}>Job Type</Text>
      <View style={styles.chipContainer}>
        {jobTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, jobType === type && styles.chipSelected]}
            onPress={() => setJobType(type)}
          >
            <Text
              style={[
                styles.chipText,
                jobType === type && styles.chipTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Office Type */}
      <Text style={styles.sectionTitle}>Office</Text>
      <View style={styles.chipContainer}>
        {officeTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, officeType === type && styles.chipSelected]}
            onPress={() => setOfficeType(type)}
          >
            <Text
              style={[
                styles.chipText,
                officeType === type && styles.chipTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={savePreferences} disabled={isUpdating}>
        <Text style={styles.saveText}>{isUpdating ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>
      {updateError && (
        <Text style={{ color: '#ff3b30', marginTop: 8 }}>Failed to save preferences. Please try again.</Text>
      )}
    </ScrollView>
  );
};

export default JobPreferencesScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F8F8",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#C7C7C7",
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: "#2E5AAC",
    borderColor: "#2E5AAC",
  },
  chipText: {
    color: "#434343",
    fontSize: 14,
  },
  chipTextSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#2E5AAC",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  saveText: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});
