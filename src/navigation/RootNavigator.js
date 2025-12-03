import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';

// Public screens
import HomeScreen from '../screens/Home/home';
import SearchScreen from '../screens/Search/SearchScreen';
import JobDetailsScreen from '../screens/JobDetails/JobDetails';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import SubCategoriesScreen from '../screens/Categories/SubCategoriesScreen';
import CategoryJobsScreen from '../screens/Categories/CategoryJobScreen';

// Auth screens
import LoginScreen from '../screens/Auth/signIn';
import SignupScreen from '../screens/Auth/signup';

// Employee & Employer app stacks
import MainTabs from './MainTabs';
import EmployerDashboard from '../screens/employerDashboard/employerDashboard';
import CreateEmployerProfile from '../screens/employerDashboard/CreateProfile';
import EmployerProfileScreen from '../screens/employerDashboard/EmployerProfile';
import PostJobScreen from '../screens/employerDashboard/PostJobScreen';
import ManageJobsScreen from '../screens/employerDashboard/EmployeeManage';
import ApplicantsListScreen from '../screens/employerDashboard/ApplicantsScreen';

import EmployeeProfileScreen from '../screens/Employee/profile';
import UploadResumeScreen from '../screens/Employee/UploadResume';
import EditPersonalInfo from '../screens/Employee/EditPersonalInfo';
import ApplySuccessScreen from '../screens/Apply/succeses';
import EmployeeAplications from '../screens/Apply/EmployeeAplications';
import SavedJobsScreen from '../screens/Saved/Saved';

// For compatibility we re-export the Employee and Employer stacks already present in App.js

const Root = createNativeStackNavigator();
const Public = createNativeStackNavigator();
const Auth = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const EmployerStack = createNativeStackNavigator();

function PublicStack() {
  return (
    <Public.Navigator screenOptions={{ headerShown: false }}>
      <Public.Screen name="PublicHome" component={HomeScreen} />
      <Public.Screen name="Search" component={SearchScreen} />
      <Public.Screen name="CategoryJobs" component={CategoryJobsScreen} />
      <Public.Screen name="Categories" component={CategoriesScreen} />
      <Public.Screen name="SubCategories" component={SubCategoriesScreen} />
      <Public.Screen name="JobDetails" component={JobDetailsScreen} />
    </Public.Navigator>
  );
}

function AuthStack() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Signup" component={SignupScreen} />
    </Auth.Navigator>
  );
}

function AppStackScreen() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Main" component={MainTabs} />
      <AppStack.Screen name="EmployeeProfile" component={EmployeeProfileScreen} />
      <AppStack.Screen name="UploadResume" component={UploadResumeScreen} />
      <AppStack.Screen name="EditPersonalInfo" component={EditPersonalInfo} />
      <AppStack.Screen name="ApplySuccess" component={ApplySuccessScreen} />
      <AppStack.Screen name="EmployeeAplications" component={EmployeeAplications} />
      <AppStack.Screen name="Saved" component={SavedJobsScreen} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const auth = useSelector((s) => s.auth);
  const isAuthenticated = !!(auth && auth.token);
  const role = auth?.role || auth?.user?.role || null;

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {/* Everyone can browse */}
        <Root.Screen name="Public" component={PublicStack} />

        {/* Authentication (only available to unauthenticated users) */}
        {!isAuthenticated && <Root.Screen name="Auth" component={AuthStack} />}

        {/* AppStack for authenticated users: choose which stack based on role */}
        {isAuthenticated ? (
          role === 'employer' ? (
            <Root.Screen name="Employer" component={() => (
              <EmployerStack.Navigator screenOptions={{ headerShown: false }}>
                <EmployerStack.Screen name="EmployerDashboard" component={EmployerDashboard} />
                <EmployerStack.Screen name="CreateEmployerProfile" component={CreateEmployerProfile} />
                <EmployerStack.Screen name="EmployerProfile" component={EmployerProfileScreen} />
                <EmployerStack.Screen name="PostJob" component={PostJobScreen} />
                <EmployerStack.Screen name="ManageJobs" component={ManageJobsScreen} />
                <EmployerStack.Screen name="ApplicantsList" component={ApplicantsListScreen} />
                <EmployerStack.Screen name="Search" component={SearchScreen} />
              </EmployerStack.Navigator>
            )} />
          ) : (
            <Root.Screen name="Employee" component={AppStackScreen} />
          )
        ) : null}
      </Root.Navigator>
    </NavigationContainer>
  );
}
