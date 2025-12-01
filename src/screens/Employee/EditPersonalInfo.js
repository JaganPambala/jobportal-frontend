import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useUpdateEmployeeProfileMutation, useGetEmployeeMeQuery } from '../../redux/api/apiSlice';

export default function EditPersonalInfo({ navigation }) {
  const { data: userData } = useGetEmployeeMeQuery();
  const [updateProfile, { isLoading }] = useUpdateEmployeeProfileMutation();

  const [form, setForm] = useState({
    fullName: userData?.fullName || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    gender: userData?.gender || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile(form).unwrap();
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
    
      Alert.alert('Error', err?.data?.message || err?.message || 'Failed to update profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Personal Information</Text>
      <TextInput style={styles.input} placeholder="Full name" value={form.fullName} onChangeText={(t) => setForm(s => ({...s, fullName: t}))} />
      <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={(t) => setForm(s => ({...s, phone: t}))} />
      <TextInput style={styles.input} placeholder="Address" value={form.address} onChangeText={(t) => setForm(s => ({...s, address: t}))} />
      <TextInput style={styles.input} placeholder="Gender" value={form.gender} onChangeText={(t) => setForm(s => ({...s, gender: t}))} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
        <Text style={{ color: '#fff' }}>{isLoading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F8FB' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ECEAF0' },
  saveBtn: { backgroundColor: '#2E5AAC', padding: 14, borderRadius: 8, marginTop: 10, alignItems: 'center' }
});
