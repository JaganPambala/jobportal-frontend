import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from 'react-redux';
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
import EmployerDashboard from "./src/screens/employerDashboard/employerDashboard.js";
import CreateEmployerProfile from "./src/screens/employerDashboard/CreateProfile.js";
import PostJobScreen from "./src/screens/employerDashboard/PostJobScreen.js";
import ManageJobsScreen from "./src/screens/employerDashboard/EmployeeManage.js";
import ApplicantsListScreen from "./src/screens/employerDashboard/ApplicantsScreen.js";
import EmployeeProfileScreen from "./src/screens/Employee/profile.js";
import UploadResumeScreen from "./src/screens/Employee/UploadResume.js";
import EditPersonalInfo from "./src/screens/Employee/EditPersonalInfo.js";
import ApplySuccessScreen from "./src/screens/Apply/succeses.js";
import EmployeeAplications from "./src/screens/Apply/EmployeeAplications.js";
import SearchScreen from "./src/screens/Search/SearchScreen.js";
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const EmployeeStack = createNativeStackNavigator();
const EmployerStack = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Onboarding" component={Onboarding} />
      <AuthStack.Screen name="SelectRole" component={SelectRoleScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="JobPreferences" component={JobPreferencesScreen} />
      <AuthStack.Screen name="Categories" component={CategoriesScreen} />
    </AuthStack.Navigator>
  );
}

function EmployeeStackScreen() {
  return (
    <EmployeeStack.Navigator screenOptions={{ headerShown: false }}>
      <EmployeeStack.Screen name="Home" component={HomeScreen} />
      <EmployeeStack.Screen name="JobDetails" component={JobDetailsScreen} />
      <EmployeeStack.Screen name="EmployeeProfile" component={EmployeeProfileScreen} />
      <EmployeeStack.Screen name="UploadResume" component={UploadResumeScreen} />
      <EmployeeStack.Screen name="EditPersonalInfo" component={EditPersonalInfo} />
      <EmployeeStack.Screen name="ApplySuccess" component={ApplySuccessScreen} />
      <EmployeeStack.Screen name="EmployeeAplications" component={EmployeeAplications} />
      <EmployeeStack.Screen name="Search" component={SearchScreen} />
      <EmployeeStack.Screen name="Categories" component={CategoriesScreen} />
    </EmployeeStack.Navigator>
  );
}

function EmployerStackScreen() {
  return (
    <EmployerStack.Navigator screenOptions={{ headerShown: false }}>
      <EmployerStack.Screen name="EmployerDashboard" component={EmployerDashboard} />
      <EmployerStack.Screen name="CreateEmployerProfile" component={CreateEmployerProfile} />
      <EmployerStack.Screen name="PostJob" component={PostJobScreen} />
      <EmployerStack.Screen name="ManageJobs" component={ManageJobsScreen} />
      <EmployerStack.Screen name="ApplicantsList" component={ApplicantsListScreen} />
      <EmployerStack.Screen name="Search" component={SearchScreen} />
    </EmployerStack.Navigator>
  );
}

export default function App() {
  const auth = useSelector((s) => s.auth);
  const isAuthenticated = !!(auth && auth.token);
  const role = auth?.role || auth?.user?.role;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated && (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        )}

        {isAuthenticated && role === 'employer' && (
          <RootStack.Screen name="Employer" component={EmployerStackScreen} />
        )}

        {isAuthenticated && role !== 'employer' && (
          <RootStack.Screen name="Employee" component={EmployeeStackScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
