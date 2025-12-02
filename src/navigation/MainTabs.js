import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';

// Import screens
import HomeScreen from '../screens/Home/home';
import JobDetailsScreen from '../screens/JobDetails/JobDetails';
import SearchScreen from '../screens/Search/SearchScreen';
import EmployeeAplications from '../screens/Apply/EmployeeAplications';
import SavedJobsScreen from '../screens/Saved/Saved';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import SubCategoriesScreen from '../screens/Categories/SubCategoriesScreen';
import CategoryJobsScreen from '../screens/Categories/CategoryJobScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeRoot" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

function ApplicationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ApplicationsRoot" component={EmployeeAplications} />
    </Stack.Navigator>
  );
}

function SavedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedRoot" component={SavedJobsScreen} />
    </Stack.Navigator>
  );
}

function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseRoot" component={CategoriesScreen} />
      <Stack.Screen name="SubCategories" component={SubCategoriesScreen} />
      <Stack.Screen name="CategoryJobs" component={CategoryJobsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

export default function MainTabs({ navigation }) {
  const { user } = useAuth();

  // If the current user is an employer, we should not show the employee MainTabs.
  // Redirect them to the employer dashboard instead so they don't get employee screens.
  useEffect(() => {
    // Only run when the user role changes; avoid including `navigation` in deps to prevent
    // re-running due to navigation object identity changes across renders
    const role = (user?.role || '').toLowerCase();
    if (role === 'employer') {
      try {
        // If we're already on Employer stack, don't replace to avoid loops
        const currentRoute = navigation.getCurrentRoute && navigation.getCurrentRoute();
        if (!currentRoute || currentRoute.name !== 'Employer') {
          navigation.replace('Employer');
        }
      } catch (e) {
        // Best effort: if anything goes wrong, still attempt to navigate (non-fatal)
        navigation.replace('Employer');
      }
    }
  }, [user?.role]);
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 18,
          left: 20,
          right: 20,
          height: 62,
          borderRadius: 14,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#eee',
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Applications') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Browse') {
            iconName = focused ? 'grid' : 'grid-outline';
          }

          // Render icon with subtle focused background and size to match old UI
          return (
            <View style={{ width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? '#EAF2FF' : 'transparent' }}>
              <Ionicons name={iconName} size={22} color={focused ? '#2E5AAC' : '#9AA0A6'} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="Applications" component={ApplicationsStack} />
      <Tab.Screen name="Saved" component={SavedStack} />
      <Tab.Screen name="Browse" component={BrowseStack} />
    </Tab.Navigator>
  );
}
