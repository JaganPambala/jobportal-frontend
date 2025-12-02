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
import { getInitials } from '../utils/userUtils';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout as logoutAction } from "../redux/slices/authSlice";
// getDisplayName removed (not used). Kept getInitials which is used to render initials.
import { api as reduxApi } from "../redux/api/apiSlice";
// import styles from "./profileMenuStyles"; // <- Styling separated

export default function ProfileMenu({ navigation, useIconTrigger = false }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  // Prefer centralized hook so we always fetch user safely
  const { auth, user, displayName } = useAuth();

  // Deterministic color from a name so each user has a consistent fallback color
  const getColorFromName = (name) => {
    const palette = ['#2E5AAC', '#4A88F2', '#6DBBFF', '#FF6B6B', '#4ECDC4', '#8E44AD', '#F39C12'];
    if (!name) return palette[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    dispatch(logoutAction());
    dispatch(reduxApi.util.resetApiState());

    setOpen(false);
    // Ensure we always return to the Auth flow (safe reset) on logout
    try {
      navigation.replace('Auth');
    } catch (e) {
      // ignore: if navigation isn't available, fallback to root handler
    }
    
    // Redux state change will automatically trigger root navigator to show AuthStack
    // No need to navigate explicitly; the root will re-evaluate based on auth state
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
          accessibilityRole="button"
          accessibilityLabel={displayName ? `${displayName} profile` : 'Profile menu'}
        >
          {user?.avatar ? (
            <Image source={{ uri: user?.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: getColorFromName(displayName) }]}>
              <Text style={styles.avatarInitial}>{getInitials(user)}</Text>
            </View>
          )}
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
                {user?.avatar ? (
                  <Image source={{ uri: user?.avatar }} style={styles.menuAvatar} />
                ) : (
                  <View style={[styles.menuAvatar, { backgroundColor: getColorFromName(displayName), alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={[styles.avatarInitial, { fontSize: 20 }]}>{getInitials(user)}</Text>
                  </View>
                )}
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.userName}>
                  {displayName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    // Normalize role comparison to avoid case differences from backend
                    const rawRole = auth?.role || user?.role || '';
                    const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : '';
                    if (__DEV__) console.log('ProfileMenu: Open profile for role=', role);

                    // Prefer EmployerProfile (full profile screen) if available, fallback to EmployerDashboard
                    if (role === 'employer') {
                      // Try navigating to EmployerProfile first (preferred)
                      try {
                        // Use replace so the previous employee stack doesn't remain in history
                        navigation.replace('EmployerProfile');
                      } catch (e) {
                        // Fallback to EmployerDashboard if EmployerProfile isn't registered in the current navigator
                        navigation.replace('Employer');
                      }
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
                ["Saved Jobs", "Saved"],
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

  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
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

