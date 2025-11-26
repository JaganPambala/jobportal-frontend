import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetRolesQuery } from '../../redux/api/apiSlice';

function SelectRoleScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const { data: rolesData, isLoading, isError } = useGetRolesQuery();

  const handleNext = async () => {
    if (!selectedRole) return alert("Please select a role");

    // Save role temporarily for Signup
    await AsyncStorage.setItem("selectedRole", selectedRole);

    navigation.navigate("Signup"); // pass to signup
  };

  const roleOptions =
    Array.isArray(rolesData) && rolesData.length
      ? rolesData.map((r) => ({ id: r.id || r.key || r.name, key: r.key || r.id || r.name, title: r.title || r.name || r.label }))
      : [
          { id: 'employee', key: 'employee', title: "I’m looking for a job" },
          { id: 'employer', key: 'employer', title: 'I want to hire talent' },
        ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeContainer}
      >
        <Text style={styles.close}>×</Text>
      </TouchableOpacity>

      <Text style={styles.logo}>Jôbizz</Text>

      {/* Title */}
      <Text style={styles.heading}>Select your role</Text>
      <Text style={styles.subHeading}>
        Choose how you want to use Jôbizz
      </Text>

      {isLoading && <Text style={{ marginBottom: 12 }}>Loading roles...</Text>}
      {isError && <Text style={{ marginBottom: 12, color: '#ff3b30' }}>Failed to load roles — showing defaults.</Text>}

      {roleOptions.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.card, selectedRole === opt.key && styles.cardSelected]}
          onPress={() => setSelectedRole(opt.key)}
        >
          <View style={styles.row}>
            <Image source={{ uri: 'file:///mnt/data/Start.jpg' }} style={styles.icon} />
            <Text style={styles.cardText}>{opt.title}</Text>
          </View>

          <View style={[styles.radio, selectedRole === opt.key && styles.radioSelected]} />
        </TouchableOpacity>
      ))}

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FC",
    paddingHorizontal: 22,
  },

  closeContainer: { marginTop: 50, width: 30 },
  close: { fontSize: 34, color: "#000" },

  logo: {
    fontSize: 26,
    color: "#2F5DA8",
    fontWeight: "700",
    textAlign: "center",
    marginTop: -30,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D0D0D",
    marginTop: 40,
  },

  subHeading: {
    fontSize: 16,
    color: "#878787",
    marginTop: 8,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },

  cardSelected: {
    borderColor: "#2F5DA8",
    backgroundColor: "#E8F1FF",
  },

  row: { flexDirection: "row", alignItems: "center" },
  icon: { width: 28, height: 28, marginRight: 14 },

  cardText: {
    fontSize: 18,
    color: "#0D0D0D",
    fontWeight: "500",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CFCFCF",
  },

  radioSelected: {
    backgroundColor: "#2F5DA8",
    borderColor: "#2F5DA8",
  },

  button: {
    backgroundColor: "#2F5DA8",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 40,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default SelectRoleScreen;