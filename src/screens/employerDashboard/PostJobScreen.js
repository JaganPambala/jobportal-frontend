import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetGroupedCategoriesQuery, usePostJobMutation } from "../../redux/api/apiSlice";
import { Alert, ActivityIndicator } from 'react-native';

export default function PostJobScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [location, setLocation] = useState("");
  const [experienceRequired, setExperienceRequired] = useState("");
  const [minEducation, setMinEducation] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Use grouped categories endpoint — we don't use flat categories here.
  const { data: groupedCategories = [] } = useGetGroupedCategoriesQuery();
  const [postJob, { isLoading: isPosting }] = usePostJobMutation();

  const jobTypes = ["Full-time", "Part-time", "Remote"];

  const handlePostJob = async () => {
    const payload = {
      title,
      categoryId,
      jobType,
      location,
      experienceRequired,
      minEducation,
      skillsRequired: skillsRequired.split(",").map((s) => s.trim()),
      salaryRange: {
        min: Number(salaryMin),
        max: Number(salaryMax),
      },
      description,
      responsibilities: responsibilities.split("\n"),
      isFeatured,
    };

    // basic validation
    if (!title.trim() || !categoryId || !description.trim() || !skillsRequired.trim()) {
      Alert.alert('Validation', 'Please fill Title, Category, Skills and Description');
      return;
    }

    
    try {
      const res = await postJob(payload).unwrap();
      
      Alert.alert('Success', 'Job posted successfully');
      navigation.navigate('EmployerDashboard');
    } catch (err) {
      
      Alert.alert('Error', err?.data?.message || err?.message || 'Failed to post job');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Job Title */}
      <Text style={styles.label}>Job Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Backend Developer"
        value={title}
        onChangeText={setTitle}
      />

      {/* Category */}
      <Text style={styles.label}>Category *</Text>
      {/* If you have grouped categories, show parents with child chips. Else fallback to flat categories list. */}
      {groupedCategories && groupedCategories.length > 0 ? (
        groupedCategories.map((group) => (
          <View key={group.parentId} style={{ marginBottom: 12 }}>
            <Text style={styles.groupTitle}>{group.parent}</Text>
            <View style={styles.rowWrap}>
              {group.children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.chip, categoryId === child.id && styles.chipSelected]}
                  onPress={() => setCategoryId(child.id)}
                >
                  <Text style={[styles.chipText, categoryId === child.id && styles.chipTextSelected]}>
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))
      ) : (
        <View style={{ marginVertical: 8 }}>
          <Text style={{ color: '#777' }}>No categories available. Please contact admin or try again later.</Text>
        </View>
      )}

      {/* Job Type */}
      <Text style={styles.label}>Job Type *</Text>
      <View style={styles.rowWrap}>
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

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Hyderabad, Remote…"
        value={location}
        onChangeText={setLocation}
      />

      {/* Experience */}
      <Text style={styles.label}>Experience Required</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex: 3 (years)"
        value={experienceRequired}
        onChangeText={setExperienceRequired}
      />

      {/* Min Education */}
      <Text style={styles.label}>Minimum Education</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: BTech, Degree…"
        value={minEducation}
        onChangeText={setMinEducation}
      />

      {/* Skills */}
      <Text style={styles.label}>Skills Required *</Text>
      <TextInput
        style={styles.input}
        placeholder="React, Node.js, MongoDB"
        value={skillsRequired}
        onChangeText={setSkillsRequired}
      />

      {/* Salary Range */}
      <Text style={styles.label}>Salary Range (Annual)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          keyboardType="numeric"
          placeholder="Min"
          value={salaryMin}
          onChangeText={setSalaryMin}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          keyboardType="numeric"
          placeholder="Max"
          value={salaryMax}
          onChangeText={setSalaryMax}
        />
      </View>

      {/* Description */}
      <Text style={styles.label}>Job Description *</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Explain the job role..."
        value={description}
        onChangeText={setDescription}
      />

      {/* Responsibilities */}
      <Text style={styles.label}>Responsibilities (Each line = one item)</Text>
      <TextInput
        style={styles.textArea}
        multiline
        placeholder={`Write each responsibility in a new line\nEx:\n- Manage backend systems\n- Handle APIs`}
        value={responsibilities}
        onChangeText={setResponsibilities}
      />

      {/* Featured */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Feature this Job</Text>
        <Switch value={isFeatured} onValueChange={setIsFeatured} />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.button, isPosting && { opacity: 0.7 }]} 
        onPress={handlePostJob}
        disabled={isPosting}
      >
        {isPosting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post Job</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F8F9FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },

  label: { fontSize: 15, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  textArea: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    height: 120,
    borderWidth: 1,
    borderColor: "#DDD",
    textAlignVertical: "top",
  },

  row: { flexDirection: "row", alignItems: "center" },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  chipSelected: {
    backgroundColor: "#2E5AAC",
    borderColor: "#2E5AAC",
  },
  chipText: { color: "#333" },
  chipTextSelected: { color: "#fff" },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },

  button: {
    backgroundColor: "#2E5AAC",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  groupTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
});
