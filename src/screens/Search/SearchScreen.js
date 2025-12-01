import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchJobsQuery, useGetGroupedCategoriesQuery } from '../../redux/api/apiSlice';

// Minimal SearchScreen with query debounce, filters and results
export default function SearchScreen({ navigation, route }) {
  const initialQuery = route?.params?.q || '';
  const [query, setQuery] = useState(initialQuery);
  const [keyword, setKeyword] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [categoryId, setCategoryId] = useState(null);
  const [jobType, setJobType] = useState(null);
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState(null);
  const [maxSalary, setMaxSalary] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState(null);

  // debounce
  const debounceTimeout = useRef(null);
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setKeyword(query);
      setPage(1);
    }, 400);
    return () => debounceTimeout.current && clearTimeout(debounceTimeout.current);
  }, [query]);

  const { data, isFetching, isError, refetch, isLoading } = useSearchJobsQuery({ keyword, page, limit, categoryId, location, jobType, skills: undefined, minSalary, maxSalary, experienceLevel });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 };

  const handleNext = () => {
    if (page < pagination.pages) setPage((p) => p + 1);
  };
  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#9AA0A6" />
          <TextInput placeholder="Search jobs..." value={query} onChangeText={setQuery} style={styles.input} />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9AA0A6" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* filters (simplified) */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, jobType === 'Full-time' && styles.filterActive]} onPress={() => setJobType(jobType === 'Full-time' ? null : 'Full-time')}>
          <Text style={[styles.filterText, jobType === 'Full-time' && styles.filterTextActive]}>Full-time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, jobType === 'Part-time' && styles.filterActive]} onPress={() => setJobType(jobType === 'Part-time' ? null : 'Part-time')}>
          <Text style={[styles.filterText, jobType === 'Part-time' && styles.filterTextActive]}>Part-time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, jobType === 'Remote' && styles.filterActive]} onPress={() => setJobType(jobType === 'Remote' ? null : 'Remote')}>
          <Text style={[styles.filterText, jobType === 'Remote' && styles.filterTextActive]}>Remote</Text>
        </TouchableOpacity>
      </View>

      {isFetching && <ActivityIndicator size="large" color="#2E5AAC" style={{ margin: 16 }} />}

      {/* Empty / error states handling */}
      {!isFetching && isError && (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={44} color="#E53935" />
          <Text style={styles.emptyTitle}>Couldn't load results</Text>
          <Text style={styles.emptyText}>There was a problem fetching search results. Please try again.</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={() => refetch()}>
            <Text style={styles.clearBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isFetching && !isError && jobs.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#9AA0A6" />
          {keyword?.trim() === '' ? (
            <>
              <Text style={styles.emptyTitle}>Start searching for jobs</Text>
              <Text style={styles.emptyText}>Type a keyword, location, or tap filters to find jobs.</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptyText}>No jobs found matching "{keyword}". Try different keywords or filters.</Text>
            </>
          )}
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setQuery('');
              setKeyword('');
              setPage(1);
              setJobType(null);
              setCategoryId(null);
              setLocation('');
            }}
          >
            <Text style={styles.clearBtnText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results list */}
      {!isFetching && !isError && jobs.length > 0 && (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('JobDetails', { jobId: item._id || item.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.company}>{item.employerId?.companyName || 'Company'}</Text>
              </View>
              <View style={styles.rightSide}><Text style={styles.salary}>{`₹${(item.salaryRange?.min || 0) / 100000}L - ₹${(item.salaryRange?.max || 0) / 100000}L`}</Text></View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        />
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
        <TouchableOpacity disabled={page <= 1} onPress={handlePrev} style={{ opacity: page <= 1 ? 0.6 : 1 }}><Text>← Prev</Text></TouchableOpacity>
        <Text>Page {pagination.page} / {pagination.pages}</Text>
        <TouchableOpacity disabled={page >= pagination.pages} onPress={handleNext} style={{ opacity: page >= pagination.pages ? 0.6 : 1 }}><Text>Next →</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F8FB' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchBox: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  input: { marginLeft: 8, flex: 1 },
  filterRow: { flexDirection: 'row', marginBottom: 12 },
  filterBtn: { backgroundColor: '#E6E8EC', padding: 8, borderRadius: 14, marginRight: 8 },
  filterActive: { backgroundColor: '#2E5AAC' },
  filterText: { color: '#333' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, flexDirection: 'row', elevation: 1 },
  jobTitle: { fontSize: 16, fontWeight: '700' },
  company: { color: '#666', marginTop: 4 },
  rightSide: { alignItems: 'flex-end' },
  salary: { fontWeight: '700', color: '#111' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyText: { color: '#8D99A6', marginTop: 6, textAlign: 'center', maxWidth: 340 },
  clearBtn: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#2E5AAC', borderRadius: 8 },
  clearBtnText: { color: '#fff', fontWeight: '700' },
});
