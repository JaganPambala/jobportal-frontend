import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRegisterMutation } from '../../redux/api/apiSlice';
// ...existing code...

const PREVIEW_IMAGE = "file:///mnt/data/Register.jpg"; // your uploaded preview image

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null); // employee | employer
  const [loading, setLoading] = useState(false);
  const [register] = useRegisterMutation();

  useEffect(() => {
    // read pre-selected role from SelectRole screen saved in AsyncStorage
    const loadRole = async () => {
      try {
        const r = await AsyncStorage.getItem("selectedRole");
        if (r) setRole(r);
      } catch (err) {
        console.warn("Failed to read selectedRole", err);
      }
    };
    loadRole();
  }, []);

  const validate = () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      Alert.alert("Validation", "Please fill all fields.");
      return false;
    }
    if (password !== confirm) {
      Alert.alert("Validation", "Passwords do not match.");
      return false;
    }
    // basic email check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Validation", "Please enter a valid email.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = { fullName, email, password, role: role || 'employee' }; 
      console.log("Register payload", payload);
      const res = await register(payload).unwrap();
      setLoading(false);

      // Registration succeeded. Do not auto-login here — send user to Login.
      Alert.alert('Success', 'Registration successful. Please log in.');
      const registeredEmail = res?.user?.email || email;
      navigation.replace('Login', { email: registeredEmail });
    } catch (err) {
      setLoading(false);
      console.error('Register error', err);
      const message = err?.data?.message || err?.message || 'Registration failed';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Image source={{ uri: PREVIEW_IMAGE }} style={styles.preview} resizeMode="cover" />

          <Text style={styles.brand}>Jôbizz</Text>
          <Text style={styles.title}>Registration 👍</Text>
          <Text style={styles.subtitle}>Let's Register. Apply to jobs!</Text>

          <View style={styles.form}>
            <View style={styles.inputCard}>
              <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputCard}>
              <TextInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputCard}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputCard}>
              <TextInput
                placeholder="Confirm Password"
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Role note */}
            <View style={{ marginTop: 8, marginBottom: 12 }}>
              <Text style={{ color: "#666" }}>
                Role: <Text style={{ fontWeight: "700" }}>{role || "Not selected"}</Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
              <Text style={styles.registerText}>{loading ? "Registering..." : "Register"}</Text>
            </TouchableOpacity>

            <View style={styles.socialRow}>
              <Text style={styles.orText}>Or continue with</Text>
              <View style={styles.socialBtns}>
                <TouchableOpacity style={styles.socialCircle}>
                  <Text></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}>
                  <Text>G</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialCircle}>
                  <Text>f</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 12 }}>
              <Text style={styles.loginText}>
                Have an account? <Text style={{ color: "#2F5DA8", fontWeight: "700" }}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFBFD" },
  flex: { flex: 1 },
  container: { paddingHorizontal: 22, paddingBottom: 40 },
  back: { marginTop: 18, width: 28 },
  backText: { fontSize: 28, color: "#0E0E0E" },
  preview: { width: 80, height: 80, alignSelf: "center", marginTop: 2, borderRadius: 10 },
  brand: { fontSize: 22, color: "#2F5DA8", fontWeight: "700", textAlign: "center", marginTop: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#0E1720", marginTop: 8, textAlign: "left" },
  subtitle: { fontSize: 14, color: "#A0AAB2", marginTop: 6 },
  form: { marginTop: 18 },
  inputCard: {
    backgroundColor: "#fff",
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECEAF0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "relative",
  },
  input: { fontSize: 16, paddingVertical: 6 },
  eyeBtn: { position: "absolute", right: 14, top: 10 },
  eyeText: { fontSize: 20 },
  registerBtn: {
    backgroundColor: "#2F5DA8",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  registerText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  socialRow: { alignItems: "center", marginTop: 18 },
  orText: { color: "#A0AAB2", marginBottom: 8 },
  socialBtns: { flexDirection: "row", justifyContent: "center", gap: 16 },
  socialCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ECEAF0",
  },
  loginText: { textAlign: "center", color: "#9EA6B2", marginTop: 16 },
});
