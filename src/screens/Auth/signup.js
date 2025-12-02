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

export default function SignupScreen({ navigation, route }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null); // employee | employer
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [register] = useRegisterMutation();

  useEffect(() => {
    // read pre-selected role from SelectRole screen saved in AsyncStorage
    const loadRole = async () => {
      try {
        // Prefer route param, then AsyncStorage
        const paramRole = route?.params?.role;
        if (paramRole) {
          setRole(paramRole);
          // persist for other flows
          try { await AsyncStorage.setItem('selectedRole', paramRole); } catch (_) {}
          return;
        }

        const r = await AsyncStorage.getItem("selectedRole");
        if (r) setRole(r);
      } catch (err) {
        
      }
    };
    loadRole();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirm.trim()) {
      newErrors.confirm = 'Confirm password is required';
    } else if (password !== confirm) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstField = Object.keys(newErrors)[0];
      Alert.alert('Validation', newErrors[firstField]);
      return false;
    }
    return true;
  };

  const validateField = (field) => {
    const newErrors = { ...errors };
    if (field === 'fullName') {
      if (!fullName.trim()) newErrors.fullName = 'Full name is required';
      else if (fullName.trim().length < 3) newErrors.fullName = 'Full name must be at least 3 characters';
      else newErrors.fullName = null;
    }
    if (field === 'email') {
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(email.trim())) newErrors.email = 'Please enter a valid email';
      else newErrors.email = null;
    }
    if (field === 'password') {
      if (!password.trim()) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      else newErrors.password = null;
    }
    if (field === 'confirm') {
      if (!confirm.trim()) newErrors.confirm = 'Confirm password is required';
      else if (password !== confirm) newErrors.confirm = 'Passwords do not match';
      else newErrors.confirm = null;
    }
    setErrors(newErrors);
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = { fullName, email, password, role: role || 'employee' }; 
      
      const res = await register(payload).unwrap();
      setLoading(false);

      // Registration succeeded. Do not auto-login here — send user to Login.
      Alert.alert('Success', 'Registration successful. Please log in.');
      const registeredEmail = res?.user?.email || email;
      // clear selectedRole after successful registration
      try { await AsyncStorage.removeItem('selectedRole'); } catch (_) {}
      navigation.replace('Login', { email: registeredEmail });
    } catch (err) {
      setLoading(false);
      
      const message = err?.data?.message || err?.message || 'Registration failed';
      Alert.alert('Error', message);
    }
  };

  const isFormValid = fullName.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(email.trim()) && password.length >= 6 && confirm === password;

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
                onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors((s) => ({ ...s, fullName: null })); }}
                onBlur={() => validateField('fullName')}
                style={styles.input}
                autoCapitalize="words"
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.inputCard}>
              <TextInput
                placeholder="E-mail"
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((s) => ({ ...s, email: null })); }}
                onBlur={() => validateField('email')}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputCard}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((s) => ({ ...s, password: null })); }}
                onBlur={() => validateField('password')}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
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
                onChangeText={(t) => { setConfirm(t); if (errors.confirm) setErrors((s) => ({ ...s, confirm: null })); }}
                onBlur={() => validateField('confirm')}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}
            </View>

            {/* Role note */}
            <View style={{ marginTop: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: "#666" }}>
                Role: <Text style={{ fontWeight: "700" }}>{role || "Not selected"}</Text>
              </Text>
              <TouchableOpacity onPress={() => navigation.replace('SelectRole')}>
                <Text style={{ color: '#2F5DA8', fontWeight: '700' }}>Change</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.registerBtn, (!isFormValid || loading) && { opacity: 0.6 }]} onPress={handleRegister} disabled={!isFormValid || loading}>
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
  errorText: { color: '#ff3b30', marginTop: 6 },
});
