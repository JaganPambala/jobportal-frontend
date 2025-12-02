// CreateEmployerProfile.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCreateEmployerProfileMutation } from '../../redux/api/apiSlice';
import { Alert } from 'react-native';

export default function CreateEmployerProfile({ navigation }) {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyProfile, setCompanyProfile] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCompanyLogo(result.assets[0].uri);
    }
  };

  const [createEmployerProfile, { isLoading: isSaving }] = useCreateEmployerProfileMutation();

  const handleSave = async () => {
    const payload = {
      companyName,
      companyWebsite,
      companyPhone,
      companyAddress,
      companyProfile,
      companyLogo,
    };

    try {
      const res = await createEmployerProfile(payload).unwrap();
      
      navigation.replace('Employer');
    } catch (err) {
      
      Alert.alert('Error', err?.data?.message || err?.message || 'Failed to save profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete Your Company Profile</Text>

      {/* Logo Upload */}
      <TouchableOpacity style={styles.logoBox} onPress={pickImage}>
        {companyLogo ? (
          <Image source={{ uri: companyLogo }} style={styles.logo} />
        ) : (
          <Ionicons name="camera" size={32} color="#6C7A92" />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Company Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter company name"
        value={companyName}
        onChangeText={setCompanyName}
      />

      <Text style={styles.label}>Company Website</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com"
        value={companyWebsite}
        onChangeText={setCompanyWebsite}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="+91 9876543210"
        keyboardType="phone-pad"
        value={companyPhone}
        onChangeText={setCompanyPhone}
      />

      <Text style={styles.label}>Company Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Hyderabad, India"
        value={companyAddress}
        onChangeText={setCompanyAddress}
      />

      <Text style={styles.label}>About Company</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder="Brief about your company..."
        multiline
        value={companyProfile}
        onChangeText={setCompanyProfile}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8F8FB", flex: 1 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 20, color: "#111" },
  label: { marginTop: 12, color: "#333", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#E8ECF2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  logo: { width: 110, height: 110, borderRadius: 55 },
  saveBtn: {
    backgroundColor: "#2E5AAC",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 17 },
});
