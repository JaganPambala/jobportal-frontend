import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import useAuth from '../hooks/useAuth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout as logoutAction } from "../redux/slices/authSlice";
import { getDisplayName } from '../utils/userUtils';
import { api as reduxApi } from "../redux/api/apiSlice";
// import styles from "./profileMenuStyles"; // <- Styling separated

export default function ProfileMenu({ navigation, useIconTrigger = false }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  // Prefer centralized hook so we always fetch user safely
  const { auth, user, displayName } = useAuth();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    dispatch(logoutAction());
    dispatch(reduxApi.util.resetApiState());

    setOpen(false);
    navigation.navigate("Login");
  };

  return (
    <View style={{ width: 60, alignItems: "flex-end" }}>
      {/* Trigger Button (Avatar OR Menu Icon) */}
      {useIconTrigger ? (
        <TouchableOpacity
          onPress={() => setOpen((v) => !v)}
          style={styles.iconMenuBtn}
        >
          <Entypo name="menu" size={22} color="#2E5AAC" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setOpen((v) => !v)}
          style={styles.avatarWrap}
        >
          <Image
            source={{ uri: user?.avatar || "file:///mnt/data/Start.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.statusDot} />
        </TouchableOpacity>
      )}

      {/* Actual Dropdown */}
      {open && (
        <>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={styles.dropdownWrapper} pointerEvents="box-none">
            <View style={styles.dropdownCard}>
            {/* Top Profile Section */}
            <View style={styles.headerRow}>
              <Image
                source={{ uri: user?.avatar || "file:///mnt/data/Start.jpg" }}
                style={styles.menuAvatar}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.userName}>
                  {displayName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    const role = auth?.role || user?.role;
                    if (role === 'employer') {
                      // Employer profile screen is not implemented yet; open EmployerDashboard for now
                      navigation.navigate('EmployerDashboard');
                    } else {
                      navigation.navigate('EmployeeProfile');
                    }
                  }}
                >
                  <Text style={styles.viewProfile}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu List */}
            <View style={{ marginTop: 16 }}>
              {[
                ["Personal Info", "PersonalInfo"],
                ["Applications", "EmployeeAplications"],
                ["Proposals", "Proposals"],
                ["Resumes", "Resumes"],
                ["Portfolio", "Portfolio"],
                ["Cover Letters", "CoverLetters"],
                ["Settings", "Settings"],
              ].map(([label, screen]) => (
                <TouchableOpacity
                  key={screen}
                  style={styles.menuItem}
                  onPress={() => {
                    setOpen(false);
                    navigation.navigate(screen);
                  }}
                >
                  <Text style={styles.menuText}>{label}</Text>
                </TouchableOpacity>
              ))}

              {/* Login / Logout */}
              {auth?.isAuthenticated ? (
                <TouchableOpacity
                  style={[styles.menuItem, { marginTop: 8 }]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.menuText, { color: "#615959ff" }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.menuItem, { marginTop: 8 }]}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={[styles.menuText, { color: "#2E5AAC" }]}>
                    Login
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
          </>
      )}
    </View>
  );
} 


const styles = StyleSheet.create({
  iconMenuBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E23B3B",
    position: "absolute",
    right: 0,
    top: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },

  dropdownWrapper: {
    position: "absolute",
    top: 55,
    right: 0,
    zIndex: 999,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
    zIndex: 998,
  },

  dropdownCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  viewProfile: {
    color: "#2E5AAC",
    marginTop: 4,
  },

  menuItem: {
    paddingVertical: 10,
  },

  menuText: {
    fontSize: 16,
    color: "#222",
  },
});

