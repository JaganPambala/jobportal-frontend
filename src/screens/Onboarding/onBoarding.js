import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// --------- Replace these URIs with require(...) in production if you move files to ./assets ---------
// Using exact local files you uploaded:
const slides = [
  {
    id: "1",
    image: { uri: "https://res.cloudinary.com/dgkcumi4q/image/upload/v1764669951/Job_hunt-amico_1_mos3px.png" },
    title: "Search your job",
    subtitle:
      "Figure out your top five priorities whether it is company culture, salary.",
  },
  {
    id: "2",
    image: { uri: "file:///mnt/data/Set A2.jpg" },
    title: "Browse jobs list",
    subtitle:
      "Our job list include several industries, so you can find the best job for you.",
  },
  {
    id: "3",
    image: { uri: "file:///mnt/data/Set A3.jpg" },
    title: "Apply to best jobs",
    subtitle:
      "You can apply to your desirable jobs very quickly and easily with ease.",
  },
  {
    id: "4",
    image: { uri: "file:///mnt/data/Set A4 - Get Started.jpg" },
    title: "Make your career",
    subtitle:
      "We help you find your dream job based on your skillset, location, demand.",
    isLast: true,
  },
  // If you used Set B variants, include them too — I included both sets in case you want alternate screens:
  {
    id: "5",
    image: { uri: "file:///mnt/data/Set B1.jpg" },
    title: "Search your dream job fast and ease",
    subtitle:
      "Figure out your top five priorities -- whether it is company culture, salary or a specific job position.",
  },
  {
    id: "6",
    image: { uri: "file:///mnt/data/Set B4 - Get Started.jpg" },
    title: "Make your dream career with job",
    subtitle:
      "We help you find your dream job according to your skillset, location & preference to build your career.",
    isLast: true,
  },
];

const DOT_SIZE = 8;

const Onboarding = ({ navigation }) => {
  const flatRef = useRef(null);
  const [index, setIndex] = useState(0);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleNext = async () => {
  if (index < slides.length - 1) {
    flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
  } else {
    await AsyncStorage.setItem("seenOnboarding", "true");
    navigation.replace("SelectRole");
  }
};


  const handleSkip = () => {
    if (navigation?.replace) navigation.replace("SelectRole");
    
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={styles.textWrap}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={[styles.nextBtn, index === slides.length - 1 && styles.exploreBtn]}
          >
            <Text style={styles.nextText}>
              {index === slides.length - 1 ? "Explore" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFD",
  },
  slide: {
    width,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  image: {
    width: width * 0.85,
    height: height * 0.45,
    marginTop: 8,
  },
  textWrap: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0E1B2B",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: "#9EA6B2",
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: "#2D5F79",
    width: DOT_SIZE * 2.2,
    borderRadius: 6,
  },
  dotInactive: {
    backgroundColor: "#E5E7EB",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  skipText: {
    color: "#9EA6B2",
    fontSize: 16,
  },
  nextBtn: {
    backgroundColor: "#2D5F79",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minWidth: 140,
    alignItems: "center",
  },
  exploreBtn: {
    // last screen bigger pill, matches designs
    minWidth: width * 0.5,
    alignSelf: "flex-end",
  },
  nextText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
