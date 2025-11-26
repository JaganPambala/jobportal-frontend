import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/splashScreen/splashScreen.js";
import Onboarding from "./src/screens/Onboarding/onBoarding.js";
//import Home from "./src/screens/Home/home.js";
import SelectRoleScreen from "./src/screens/Role/selectRoleScreen.js";
import SignupScreen from "./src/screens/Auth/signup.js";
import LoginScreen from "./src/screens/Auth/signIn.js";
import JobPreferencesScreen from "./src/screens/preferences/JobPreferencesScreen.js";
import CategoriesScreen from "./src/screens/Categories/CategoriesScreen.js";
import  HomeScreen from "./src/screens/Home/home.js";
import JobDetailsScreen from "./src/screens/JobDetails/JobDetails.js";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} /> 
        <Stack.Screen name="JobPreferences" component={JobPreferencesScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
