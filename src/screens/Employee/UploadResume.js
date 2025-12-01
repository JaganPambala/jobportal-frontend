import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadEmployeeResumeMutation } from '../../redux/api/apiSlice';

export default function UploadResumeScreen({ navigation }) {
  const [uploadResume, { isLoading }] = useUploadEmployeeResumeMutation();

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (res.type === 'success') {
        const { uri, name } = res;
        // Build FormData
        const formData = new FormData();
        const fileType = name.split('.').pop();
        const mimeType = /pdf/i.test(fileType) ? 'application/pdf' : 'application/octet-stream';
        formData.append('resume', { uri, name, type: mimeType });

        try {
          const result = await uploadResume(formData).unwrap();
          Alert.alert('Success', 'Resume uploaded successfully');
          navigation.goBack();
        } catch (err) {
          
          Alert.alert('Error', err?.data?.message || err?.message || 'Failed to upload resume');
        }
      }
    } catch (err) {
      
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Resume</Text>
      <Text style={styles.subtitle}>Select a PDF or DOC file to upload as your resume</Text>

      <TouchableOpacity style={styles.pickBtn} onPress={pickDocument} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.pickBtnText}>Pick File</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.skipBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F8FB' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#777', marginBottom: 20 },
  pickBtn: { backgroundColor: '#2E5AAC', padding: 14, borderRadius: 10 },
  pickBtnText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  skipBtn: { marginTop: 12, padding: 12 },
  skipBtnText: { color: '#2E5AAC', textAlign: 'center' },
});
