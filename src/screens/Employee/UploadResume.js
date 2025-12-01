import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useUploadEmployeeResumeMutation } from '../../redux/api/apiSlice';

export default function UploadResumeScreen({ navigation }) {
  console.log('UploadResumeScreen mounted');
  const [uploadResume, { isLoading }] = useUploadEmployeeResumeMutation();
  const [isPickingFile, setIsPickingFile] = useState(false);

  const pickDocument = async () => {
    console.log('pickDocument called');
    try {
      console.log('Opening document picker...');
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      
      console.log('DocumentPicker response:', res);
      
      // Handle response - newer Expo returns { canceled, assets }
      if (res.canceled) {
        console.log('Document selection cancelled');
        return;
      }
      
      // Get the first asset from the assets array
      const asset = res.assets?.[0];
      if (!asset) {
        console.log('No asset returned');
        return;
      }
      
      const { uri, name, mimeType: assetMimeType } = asset;
      
      console.log('Selected file:', { uri, name, assetMimeType });
      
      // Build FormData with proper multipart structure
      const formData = new FormData();
      
      // Determine MIME type based on file extension or provided type
      const fileType = name.split('.').pop()?.toLowerCase();
      let mimeType = assetMimeType || 'application/octet-stream';
      if (/pdf/i.test(fileType)) mimeType = 'application/pdf';
      else if (/doc$/.test(fileType)) mimeType = 'application/msword';
      else if (/docx/i.test(fileType)) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      console.log('File details:', { name, fileType, mimeType });
      
      // Append file to FormData with key matching backend expectation
      formData.append('resume', {
        uri,
        name,
        type: mimeType,
      });

      console.log("-------------------------------------------")
      console.log('Uploading file:', name, 'with MIME type:', mimeType);
      
      try {
        const result = await uploadResume(formData).unwrap();
        console.log('Upload response:', result);
        Alert.alert('Success', 'Resume uploaded successfully');
        navigation.goBack();
      } catch (err) {
        console.error('Upload error details:', {
          message: err?.message,
          data: err?.data,
          status: err?.status,
          originalStatus: err?.originalStatus,
        });
        Alert.alert('Error', err?.data?.message || err?.message || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert('Error', 'Failed to open document picker');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Resume</Text>
      <Text style={styles.subtitle}>Select a PDF or DOC file to upload as your resume</Text>

      <TouchableOpacity style={styles.pickBtn} onPress={pickDocument} disabled={isLoading || isPickingFile}>
        {isLoading || isPickingFile ? <ActivityIndicator color="#fff" /> : <Text style={styles.pickBtnText}>Pick File</Text>}
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
