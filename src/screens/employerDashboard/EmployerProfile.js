import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useGetEmployerMeQuery, useCreateEmployerProfileMutation, useUploadEmployerLogoMutation, useUpdateEmployerDetailsMutation } from "../../redux/api/apiSlice";

const baseUrl = "http://10.0.2.2:5000";

const getFullLogoUrl = (logoPath) => {
  if (!logoPath) return null;
  // If it's already a full URL, return as-is
  if (logoPath.startsWith("http")) return logoPath;
  // If it's a relative path, prepend base URL
  return `${baseUrl}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`;
};

export default function EmployerProfileScreen({ navigation }) {
  const { data: employer, isLoading, refetch } = useGetEmployerMeQuery();
  const [createProfile] = useCreateEmployerProfileMutation();
  const [updateDetails, { isLoading: isSaving }] = useUpdateEmployerDetailsMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadEmployerLogoMutation();
  const [editMode, setEditMode] = useState(false);
  const [logo, setLogo] = useState(null);
  const [formData, setFormData] = useState({
    companyName: employer?.companyName || "",
    companyWebsite: employer?.companyWebsite || "",
    companyPhone: employer?.companyPhone || "",
    companyAddress: employer?.companyAddress || "",
    companyProfile: employer?.companyProfile || "",
  });

  // Update formData when employer data loads
  React.useEffect(() => {
    if (employer) {
      setFormData({
        companyName: employer.companyName || "",
        companyWebsite: employer.companyWebsite || "",
        companyPhone: employer.companyPhone || "",
        companyAddress: employer.companyAddress || "",
        companyProfile: employer.companyProfile || "",
      });
    }
  }, [employer]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleLogoUpload = async () => {
    if (!logo) return;

    try {
      const formData = new FormData();
      const filename = logo.split("/").pop();
      const mimeType = "image/jpeg";

      formData.append("logo", {
        uri: logo,
        name: filename,
        type: mimeType,
      });

      await uploadLogo(formData).unwrap();
      Alert.alert("Success", "Company logo updated");
      setLogo(null);
      refetch();
    } catch (err) {
      console.error("Logo upload error:", err);
      Alert.alert("Error", err?.data?.message || "Failed to upload logo");
    }
  };

  const handleSave = async () => {
    if (!formData.companyName.trim()) {
      Alert.alert("Validation", "Company name is required");
      return;
    }

    try {
      const payload = {
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyPhone: formData.companyPhone,
        companyAddress: formData.companyAddress,
        companyProfile: formData.companyProfile,
      };
      await updateDetails(payload).unwrap();
      Alert.alert("Success", "Company profile updated successfully");
      setEditMode(false);
      setLogo(null);
      refetch();
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", err?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E5AAC" />
      </View>
    );
  }

  if (!employer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No profile found</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("CreateEmployerProfile")}
        >
          <Text style={styles.btnText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#2E5AAC" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Company Profile</Text>
        
        <TouchableOpacity 
          onPress={() => setEditMode(true)}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.editButton}
          accessibilityRole="button"
          accessibilityLabel="Edit company profile"
        >
          <Ionicons name="pencil" size={24} color="#2E5AAC" />
        </TouchableOpacity>
      </View>

      {/* Logo & Company Name */}
      <View style={styles.logoSection}>
        <TouchableOpacity onPress={pickImage} disabled={isUploadingLogo}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: getFullLogoUrl(employer.companyLogo) || "file:///mnt/data/Start.jpg",
              }}
              style={styles.logo}
            />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        
        {logo && (
          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity
              style={[styles.uploadBtn, isUploadingLogo && { opacity: 0.5 }]}
              onPress={handleLogoUpload}
              disabled={isUploadingLogo}
            >
              <Text style={styles.uploadBtnText}>
                {isUploadingLogo ? "Uploading..." : "Upload Logo"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setLogo(null)}
              disabled={isUploadingLogo}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.companyName}>{employer.companyName || "Company Name"}</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="globe" size={20} color="#2E5AAC" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.infoLabel}>Website</Text>
            <Text style={styles.infoValue}>{employer.companyWebsite || "N/A"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#2E5AAC" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{employer.companyPhone || "N/A"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#2E5AAC" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{employer.companyAddress || "N/A"}</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutLabel}>About Company</Text>
        <Text style={styles.aboutText}>
          {employer.companyProfile || "No description provided"}
        </Text>
      </View>

      {/* Edit Modal */}
      <Modal visible={editMode} animationType="slide">
        <ScrollView style={styles.container}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditMode(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              <Text
                style={[
                  styles.saveModalText,
                  isSaving && { opacity: 0.5 },
                ]}
              >
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo Upload */}
          <TouchableOpacity style={styles.logoBox} onPress={pickImage}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.editLogo} />
            ) : employer?.companyLogo ? (
              <Image
                source={{
                  uri: getFullLogoUrl(employer.companyLogo),
                }}
                style={styles.editLogo}
              />
            ) : (
              <Ionicons name="camera" size={40} color="#6C7A92" />
            )}
          </TouchableOpacity>

          {/* Form Fields */}
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            value={formData.companyName}
            onChangeText={(text) => setFormData({ ...formData, companyName: text })}
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            value={formData.companyWebsite}
            onChangeText={(text) => setFormData({ ...formData, companyWebsite: text })}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
            value={formData.companyPhone}
            onChangeText={(text) => setFormData({ ...formData, companyPhone: text })}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="City, Country"
            value={formData.companyAddress}
            onChangeText={(text) => setFormData({ ...formData, companyAddress: text })}
          />

          <Text style={styles.label}>About Company</Text>
          <TextInput
            style={[styles.input, { height: 120 }]}
            placeholder="Tell us about your company..."
            multiline
            value={formData.companyProfile}
            onChangeText={(text) => setFormData({ ...formData, companyProfile: text })}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.btnText}>{isSaving ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8FB" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8FB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEAF0",
    zIndex: 50,
  },
  backButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },
  editButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  logoSection: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEAF0",
  },
  logoContainer: {
    position: "relative",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: "#E8ECF2",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 12,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2E5AAC",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
    justifyContent: "center",
  },
  uploadBtn: {
    backgroundColor: "#2E5AAC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  uploadBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelBtn: {
    backgroundColor: "#E8ECF2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelBtnText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  editLogo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  companyName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECEAF0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#9EA6B2",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
    marginTop: 4,
  },
  aboutSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECEAF0",
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: "#6C7A92",
    lineHeight: 22,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEAF0",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  closeText: { color: "#2E5AAC", fontSize: 16, fontWeight: "600" },
  saveModalText: { color: "#2E5AAC", fontSize: 16, fontWeight: "600" },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#E8ECF2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  label: {
    marginLeft: 20,
    marginTop: 12,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  btn: {
    backgroundColor: "#2E5AAC",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 16 },
  errorText: { fontSize: 16, color: "#6C7A92", marginBottom: 16 },
});
