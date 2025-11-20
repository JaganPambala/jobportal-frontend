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
    const seen = await AsyncStorage.getItem("seenOnboarding");

    if (seen === "true") {
      navigation.replace("Home");
    } else {
      navigation.replace("Onboarding");
    }
  };

  const timer = setTimeout(check, 2000);

  return () => clearTimeout(timer);
}, []);


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
