import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetRolesQuery } from "../../redux/api/apiSlice";

function SelectRoleScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const { data: rolesData, isLoading, isError } = useGetRolesQuery();

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("Onboarding");
    }
  };

  const handleNext = async () => {
    if (!selectedRole) return alert("Please select a role");

    await AsyncStorage.setItem("selectedRole", selectedRole);
    navigation.replace("Signup", { role: selectedRole });
  };

  const roleOptions =
    Array.isArray(rolesData) && rolesData.length
      ? rolesData.map((r) => ({
          id: r.id || r.key || r.name,
          key: r.key || r.id || r.name,
          title: r.title || r.name || r.label,
        }))
      : [
          { id: "employee", key: "employee", title: "I’m looking for a job" },
          { id: "employer", key: "employer", title: "I want to hire talent" },
        ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        
        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeContainer}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={styles.close}>×</Text>
        </TouchableOpacity>

        {/* Logo */}
        <Text style={styles.logo}>Jôbizz</Text>

        {/* Text */}
        <Text style={styles.heading}>Select your role</Text>
        <Text style={styles.subHeading}>Choose how you want to use Jôbizz</Text>

        {/* API Status */}
        {isLoading && <Text style={styles.apiText}>Loading roles...</Text>}
       

        {/* Options */}
        {roleOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.card, selectedRole === opt.key && styles.cardSelected]}
            onPress={() => setSelectedRole(opt.key)}
          >
            <View style={styles.row}>
              <Image
                source={{ uri: "file:///mnt/data/Start.jpg" }}
                style={styles.icon}
              />
              <Text style={styles.cardText}>{opt.title}</Text>
            </View>

            <View
              style={[styles.radio, selectedRole === opt.key && styles.radioSelected]}
            />
          </TouchableOpacity>
        ))}

        {/* Next Button */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9F9FC",
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },

  /* NEW CLOSE BUTTON STYLING */
  closeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  close: {
    fontSize: 28,
    color: "#000",
    fontWeight: "300",
    lineHeight: 30,
  },

  /* LOGO */
  logo: {
    fontSize: 30,
    color: "#2F5DA8",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 30,
  },

  /* HEADINGS */
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D0D0D",
  },

  subHeading: {
    fontSize: 16,
    color: "#878787",
    marginTop: 6,
    marginBottom: 25,
  },

  apiText: {
    marginBottom: 10,
    fontSize: 14,
  },

  /* ROLE CARDS */
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  cardSelected: {
    borderColor: "#2F5DA8",
    backgroundColor: "#E9F1FF",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 30,
    height: 30,
    marginRight: 14,
  },

  cardText: {
    fontSize: 18,
    color: "#0D0D0D",
    fontWeight: "500",
  },

  /* RADIO BUTTON */
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

  /* BUTTON */
  button: {
    backgroundColor: "#2F5DA8",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 30,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default SelectRoleScreen;
