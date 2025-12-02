// HomeScreen.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useIsFocused } from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetFeaturedJobsQuery, useGetPopularJobsQuery } from '../../redux/api/apiSlice';
import ProfileMenu from '../../components/ProfileComponent';

const baseUrl = 'http://10.0.2.2:5000';
const getFullLogoUrl = (logoPath) => {
  if (!logoPath) return 'file:///mnt/data/Start.jpg';
  if (typeof logoPath !== 'string') return 'file:///mnt/data/Start.jpg';
  if (logoPath.startsWith('http') || logoPath.startsWith('file')) return logoPath;
  return `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
};

// Use your uploaded preview image if you want a quick visual (not required)
const PREVIEW_URI = "file:///mnt/data/Homepage 6.jpg"; // <- your uploaded screenshot (for preview/testing)

const { width } = Dimensions.get("window");

const fallbackFeaturedJobs = [
  {
    id: "f1",
    title: "Junior Executive",
    company: "Shell plc",
    tags: ["Administration", "Full-Time", "Junior"],
    salary: "$98,000/year",
    location: "Texas, USA",
    color: "#4A88F2",
    logo: "", // replace with your asset
  },
  {
    id: "f2",
    title: "Product Designer",
    company: "InVision",
    tags: ["Design", "Full-Time"],
    salary: "$110,000/year",
    location: "Remote",
    color: "#6DBBFF",
    logo: "",
  },
];

const fallbackPopularJobs = [
  {
    id: "p1",
    title: "Sr Developer",
    company: "Spotify",                                           
    salary: "$115,000/y",
    logo: "",
  },
  {
    id: "p2",
    title: "Jr Executive",
    company: "Pinterest",
    salary: "$96,000/y",
    logo: "",
  },
];

function FeaturedCard({ item, navigation, user }) {
  const tags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : [item.jobType || ''];
  return (
    <View style={[styles.featuredCard, { backgroundColor: item.color }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: getFullLogoUrl(item.logo) }} style={styles.featuredLogo} />
         
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.featuredCompany} numberOfLines={1}>{item.company}</Text>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            {tags.filter(Boolean).slice(0, 2).map((t) => (
              <View style={styles.tag} key={t}>
                <Text style={styles.tagText} numberOfLines={1}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {user && user.role === 'employee' && !user.fullName && (
        <TouchableOpacity onPress={() => navigation.navigate('EditPersonalInfo')} style={{ marginBottom: 12 }}>
          <Text style={{ color: '#2E5AAC', fontWeight: '700' }}>Complete your profile</Text>
        </TouchableOpacity>
      )}
      {user && user.role === 'employer' && !user.companyName && (
        <TouchableOpacity onPress={() => navigation.navigate('Employer', { screen: 'CreateEmployerProfile' })} style={{ marginBottom: 12 }}>
          <Text style={{ color: '#2E5AAC', fontWeight: '700' }}>Complete company profile</Text>
        </TouchableOpacity>
      )}

      <View style={styles.featuredFooter}>
        <Text style={styles.featuredSalary} numberOfLines={1}>{item.salary}</Text>
        <Text style={styles.featuredLocation} numberOfLines={1}>{item.location}</Text>
      </View>
    </View>
  );
}

function PopularCard({ item }) {
  return (
    <View style={styles.popCard}>
      <Image source={{ uri: getFullLogoUrl(item.logo) }} style={styles.popLogo} />
      <Text style={styles.popTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.popCompany} numberOfLines={1}>{item.company}</Text>
      <Text style={styles.popSalary} numberOfLines={1}>{item.salary}</Text>
    </View>
  );
}
function HomeScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(false);
  const { user, firstName } = useAuth();
  React.useEffect(() => {
    // Redirect only when the user's role changes and we're not already on the Employer stack
    const role = (user?.role || '').toLowerCase();
    if (role === 'employer') {
      try {
        const current = navigation.getCurrentRoute && navigation.getCurrentRoute();
        if (!current || current.name !== 'Employer') {
          navigation.replace('Employer');
        }
      } catch (e) {
        navigation.replace('Employer');
      }
    }
  }, [user?.role]);
  const carouselRef = useRef(null);

  // RTK Query hooks for featured and popular jobs
  const { data: featuredResponse, isLoading: featuredLoading, isError: featuredError } = useGetFeaturedJobsQuery();
  const { data: popularResponse, isLoading: popularLoading, isError: popularError } = useGetPopularJobsQuery();

  // Transform API data: extract jobs array and map to card format
  const transformJobData = (apiResponse) => {
    if (!apiResponse) return [];
    const jobs = Array.isArray(apiResponse.jobs) ? apiResponse.jobs : (Array.isArray(apiResponse) ? apiResponse : []);
    return jobs.map((job) => ({
      id: job._id || job.id,
      title: job.title,
      company: job.employerId?.companyName || 'Company',
      location: job.location,
      jobType: job.jobType,
      categoryName: job.categoryId?.name || 'Uncategorized',
      salaryMin: job.salaryRange?.min || 0,
      salaryMax: job.salaryRange?.max || 0,
      salary: `₹${(job.salaryRange?.min || 0) / 100000}L - ₹${(job.salaryRange?.max || 0) / 100000}L`,
      logo: job.employerId?.companyLogo || 'file:///mnt/data/Start.jpg',
      tags: [job.categoryId?.name || '', job.jobType || ''].filter(Boolean),
      color: ['#4A88F2', '#6DBBFF', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 5)],
    }));
  };

  const featuredJobs = transformJobData(featuredResponse).length > 0 ? transformJobData(featuredResponse) : fallbackFeaturedJobs;
  const popularJobs = transformJobData(popularResponse).length > 0 ? transformJobData(popularResponse) : fallbackPopularJobs;

  const renderHeader = () => (
    <>
      {/* Header: Greeting + avatar */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcomeSmall}>Welcome Back!</Text>
          <Text style={styles.welcomeName}>{firstName} 👋</Text>
        </View>
        <ProfileMenu navigation={navigation} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Search', { q: query })} style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#9AA0A6" />
          <TextInput
            placeholder="Search a job or position"
            placeholderTextColor="#9AA0A6"
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => navigation.navigate('Search', { q: query })}
            onFocus={() => navigation.navigate('Search', { q: query })}
          />
        </TouchableOpacity>
      </View>

      {/* Featured Jobs */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('JobsList')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={carouselRef}
        data={featuredJobs}
        keyExtractor={(i) => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate="fast"
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('JobDetails', { jobId: item.id })} style={{ width: width - 40, marginRight: 16 }} activeOpacity={0.8}>
            <View style={{ width: width - 60, marginRight: 16 }}>
              <FeaturedCard item={item} navigation={navigation} user={user} />
            </View>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 12 }}
      />

      {/* Dots for carousel (simple) */}
      <View style={styles.dotsRow}>
        {featuredJobs.map((_, i) => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
        ))}
      </View>

      {/* Popular Jobs header */}
      <View style={[styles.sectionHeader, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>Popular Jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Browse', { screen: 'BrowseRoot' })}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={popularJobs}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('JobDetails', { jobId: item.id })} activeOpacity={0.8}>
            <PopularCard item={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 20 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          featuredLoading || popularLoading ? (
            <ActivityIndicator size="large" color="#2E5AAC" style={{ margin: 16 }} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Ionicons name="search" size={48} color="#9AA0A6" />
              <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 12 }}>No results</Text>
              <Text style={{ color: '#8D99A6', textAlign: 'center', maxWidth: 340 }}>No jobs found. Try different keywords or filters.</Text>
            </View>
          )
        }
      />

      {/* Bottom Tab Bar is now part of the global MainTabs navigator */}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F8FB" },
  container: { padding: 20, paddingBottom: 120 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  welcomeSmall: { color: "#8B95A1", fontSize: 14 },
  welcomeName: { fontSize: 26, fontWeight: "800", color: "#0E1630" },

  

  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  searchBox: {
    flex: 1,
    backgroundColor: "#F0F2F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { marginLeft: 8, fontSize: 15, flex: 1 },
  filterBtn: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#222" },
  seeAll: { color: "#9BA3AB" },

  featuredCard: {
    borderRadius: 20,
    padding: 18,
    minHeight: 150,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  featuredLogo: { width: 56, height: 56, borderRadius: 12 },
  featuredTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  featuredCompany: { color: "#EAF2FF", marginTop: 2 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: { color: "#fff", fontSize: 12 },

  featuredFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  featuredSalary: { color: "#fff", fontSize: 16, fontWeight: "700" },
  featuredLocation: { color: "#fff", fontSize: 14 },

  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 8, marginBottom: 16 },
  dot: { width: 10, height: 6, borderRadius: 4, backgroundColor: "#E0E6EE", marginHorizontal: 6 },
  dotActive: { backgroundColor: "#2E5AAC", width: 24 },

  popRow: {
    marginTop: 12,
  },
  popCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 1,
  },
  popLogo: { width: 56, height: 56, marginBottom: 10 },
  popTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6, color: "#111" },
  popCompany: { color: "#9AA0A6", marginBottom: 8 },
  popSalary: { fontWeight: "700", color: "#222" },

  // tabBar styles are now handled by MainTabs navigator
  tabItem: { alignItems: "center", justifyContent: "center" },
});

export default HomeScreen;  