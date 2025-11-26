import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoginMutation } from '../../redux/api/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';

const PREVIEW_IMAGE = "file:///mnt/data/Log in.jpg"; // your uploaded screenshot

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [login] = useLoginMutation();

  // Prefill email if coming from Signup
  React.useEffect(() => {
    const pre = route?.params?.email;
    if (pre) setEmail(pre);
  }, [route]);

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation", "Please enter email and password.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ email, password }).unwrap();
      setLoading(false);

      const { token, user } = res;
      // persist token and user
      if (token) await AsyncStorage.setItem('token', token);
      if (user) await AsyncStorage.setItem('user', JSON.stringify(user));

      // update redux auth state
      dispatch(setCredentials({ user, token }));

      if (user?.role === 'employee') {
        navigation.replace('JobPreferences');
      } else if (user?.role === 'employer') {
        navigation.replace('EmployerSetup');
      } else {
        navigation.replace('Home');
      }
    } catch (err) {
      setLoading(false);
      console.log('login error', err);
      const message = err?.data?.message || err?.message || 'Login failed';
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
          
          {/* Back Button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          {/* Illustration */}
          <Image source={{ uri: PREVIEW_IMAGE }} style={styles.preview} resizeMode="cover" />

          {/* Branding */}
          <Text style={styles.brand}>Jôbizz</Text>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Let’s log in. Apply to jobs!</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputCard}>
              <TextInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            {/* Password */}
            <View style={styles.inputCard}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
              />

              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              <Text style={styles.loginText}>{loading ? "Logging in..." : "Log in"}</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <Text style={styles.or}>Or continue with</Text>
              <View style={styles.socialBtns}>
                <View style={styles.socialCircle}><Text></Text></View>
                <View style={styles.socialCircle}><Text>G</Text></View>
                <View style={styles.socialCircle}><Text>f</Text></View>
              </View>
            </View>

            {/* Register Link */}
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.registerText}>
                Haven’t an account? <Text style={{ color: "#2F5DA8", fontWeight: "700" }}>Register</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

//
// -------------- Styles --------------
//
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFBFD" },
  flex: { flex: 1 },
  container: { paddingHorizontal: 22, paddingBottom: 40 },
  back: { marginTop: 18, width: 28 },
  backText: { fontSize: 28, color: "#0E0E0E" },

  preview: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginTop: 2,
    borderRadius: 10,
  },

  brand: { fontSize: 22, fontWeight: "700", color: "#2F5DA8", marginTop: 8 },
  title: { fontSize: 32, fontWeight: "800", marginTop: 8 },
  subtitle: { fontSize: 14, color: "#A0AAB2", marginTop: 6 },

  form: { marginTop: 20 },

  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECEAF0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    position: "relative",
  },

  input: { fontSize: 16, paddingVertical: 6 },

  eyeBtn: { position: "absolute", right: 14, top: 12 },
  eyeText: { fontSize: 20 },

  loginBtn: {
    backgroundColor: "#2F5DA8",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 22,
  },

  loginText: { color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center" },

  forgot: {
    textAlign: "center",
    marginTop: 14,
    color: "#67727E",
  },

  socialRow: { alignItems: "center", marginTop: 20 },
  or: { color: "#A0AAB2", marginBottom: 12 },
  socialBtns: { flexDirection: "row", gap: 18 },

  socialCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECEAF0",
  },

  registerText: {
    textAlign: "center",
    marginTop: 16,
    color: "#9EA6B2",
  },
});
