import React, { useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    const check = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
          const userJson = await AsyncStorage.getItem("user");
          const user = userJson ? JSON.parse(userJson) : null;
          const role = (user?.role || "").toLowerCase();

          if (role === "employer") navigation.replace("Employer");
          else navigation.replace("Employee");
          return;
        }

        const seen = await AsyncStorage.getItem("seenOnboarding");
        navigation.replace(seen === "true" ? "SelectRole" : "Onboarding");
      } catch (e) {
        navigation.replace("Onboarding");
      }
    };

    const timer = setTimeout(check, 1200);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* Centered Logo */}
      <View style={styles.centerWrapper}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dgkcumi4q/image/upload/v1764669490/Group_218_hrvxcj.png",
          }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#163D5A", // background color
  },

  /* Wrapper to center the image */
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Small sized centered image */
  logo: {
    width: 180,   // adjust size here
    height: 180,  // adjust size here
  },
});

export default SplashScreen;
