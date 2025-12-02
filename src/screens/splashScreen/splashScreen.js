import React, { useEffect } from "react";
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";


// If you use a navigation library, uncomment
// import { useNavigation } from '@react-navigation/native';

const SplashScreen = ({ navigation }) => {
  // const nav = useNavigation(); // if not passed as prop

  useEffect(() => {
    const check = async () => {
      try {
        // Order: if token exists -> go to Home
          const token = await AsyncStorage.getItem('token');
          if (token) {
            // Try to determine user role from stored user in AsyncStorage and route accordingly
            try {
              const userJson = await AsyncStorage.getItem('user');
              const user = userJson ? JSON.parse(userJson) : null;
              const role = (user?.role || '').toLowerCase();
              if (role === 'employer') {
                navigation.replace('EmployerDashboard');
              } else {
                navigation.replace('Home');
              }
            } catch (e) {
              // if parsing fails, fallback to generic Home
              navigation.replace('Home');
            }
            return;
          }

        // No token: check whether onboarding was seen before
        const seen = await AsyncStorage.getItem('seenOnboarding');
        if (seen === 'true') {
          navigation.replace('SelectRole');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (e) {
        console.warn('Splash navigation check failed', e);
        // fallback to onboarding
        navigation.replace('Onboarding');
      }
    };

    const timer = setTimeout(check, 1200);
    return () => clearTimeout(timer);
  }, [navigation]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      {/** --------- VARIANT A: use absolute file path (useful for this environment) --------- */}
      {/* If you want to use the uploaded file path directly: */}
      <Image
        source={{ uri: "file:///mnt/data/Start.jpg" }}
        style={styles.fullscreenImage}
        resizeMode="cover"
      />

      {/** --------- VARIANT B (recommended): use local asset placed in ./assets/Start.jpg --------- */}
      {/*
      <ImageBackground
        source={require("../assets/Start.jpg")}
        style={styles.fullscreenImage}
        resizeMode="cover"
      >
        // If you want to overlay anything (spinner, logo, etc.) put it here
      </ImageBackground>
      */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#163D5A", // fallback color while loading
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
