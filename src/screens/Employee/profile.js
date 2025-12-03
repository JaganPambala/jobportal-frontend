import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Linking, Modal, TextInput } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useGetEmployeeMeQuery, useDeleteEmployeeResumeMutation, useUploadEmployeeAvatarMutation, useAddEmployeeEducationMutation, useUpdateEmployeeEducationMutation, useDeleteEmployeeEducationMutation, useUpdateEmployeeSkillsMutation } from '../../redux/api/apiSlice';
import * as ImagePicker from 'expo-image-picker';

// Helper function to construct full avatar URL
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "https://ui-avatars.com/api/?name=Jagan";
  const baseUrl = "http://10.0.2.2:5000";
  return avatarPath.startsWith('http') ? avatarPath : `${baseUrl}${avatarPath}`;
};

// Helper function to extract filename from path
const getFileName = (filePath) => {
  if (!filePath) return 'Unknown file';
  return filePath.split('/').pop();
};

function EmployeeProfileScreen({ navigation }) {
  // Fetch user data from backend
  const { data: userData, isLoading, isError } = useGetEmployeeMeQuery();
  const [deleteResume, { isLoading: isDeleting }] = useDeleteEmployeeResumeMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadEmployeeAvatarMutation();
  const [addEducation] = useAddEmployeeEducationMutation();
  const [updateEducation] = useUpdateEmployeeEducationMutation();
  const [deleteEducation] = useDeleteEmployeeEducationMutation();
  const [updateSkills, { isLoading: isUpdatingSkills }] = useUpdateEmployeeSkillsMutation();

  // Prepare user object
  const user = userData || {
    fullName: "Jagan Pambala",
    email: "jagan@gmail.com",
    avatar: "",
    phone: "9876543210",
    address: "Hyderabad, India",
    gender: "M",
    experience: 2,
    skills: ["React", "Node.js", "MongoDB", "JavaScript"],
    education: [
      {
        degree: "B.Tech",
        specialization: "CSE",
        institution: "JNTU Hyderabad",
        passedOutYear: "2023",
      },
    ],
    resumeUrl: "",
    jobPreferences: {
      selectedRoles: ["Full Stack Developer", "Backend Developer"],
      selectedLocation: "Hyderabad",
      jobType: "Full-Time",
      officeType: "Hybrid",
    },
    selectedCategories: ["Software Development", "IT Services"],
  };

  // All state hooks AFTER user is defined
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [eduForm, setEduForm] = useState({ degree: '', specialization: '', institution: '', passedOutYear: '' });
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [localSkills, setLocalSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');


  useEffect(() => {
    const incoming = user?.skills || [];
    
    const isSame = Array.isArray(incoming) && Array.isArray(localSkills) && incoming.length === localSkills.length && incoming.every((s, i) => s === localSkills[i]);
    if (!isSame) {
      setLocalSkills(Array.isArray(incoming) ? [...incoming] : []);
    }
  }, [user?.skills]);

  if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading profile...</Text></View>;
  if (isError) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Failed to load profile</Text></View>;

  const handleViewResume = () => {
    if (user?.resumeUrl) {
      // Construct full URL if resumeUrl is a relative path
      const baseUrl = "http://10.0.2.2:5000";
      const fullUrl = user.resumeUrl.startsWith('http') 
        ? user.resumeUrl 
        : `${baseUrl}${user.resumeUrl}`;
      
      console.log('Opening resume URL:', fullUrl);
      Linking.openURL(fullUrl).catch((err) => {
        console.error('Error opening resume:', err);
        Alert.alert('Error', 'Unable to open resume');
      });
    }
  };

  const handleDeleteResume = () => {
    Alert.alert('Delete Resume', 'Do you want to delete your resume?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteResume().unwrap();
          Alert.alert('Deleted', 'Resume deleted successfully');
        } catch (err) {
          
          Alert.alert('Error', err?.data?.message || err?.message || 'Failed to delete resume');
        }
      } }
    ]);
  };

  const pickAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.7 });
      if (!res.canceled) {
        const asset = res.assets[0];
        const formData = new FormData();
        const name = asset.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('avatar', { uri: asset.uri, name, type });
        try {
          const result = await uploadAvatar(formData).unwrap();
          console.log('Avatar upload response:', result);
          Alert.alert('Success', 'Avatar updated');
          // Refetch user data to get the updated avatar URL
          // This will trigger useGetEmployeeMeQuery to refetch
        } catch (err) {
          console.error('Avatar upload error:', err);
          Alert.alert('Error', err?.data?.message || err?.message || 'Failed to upload avatar');
        }
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  };

  

  const openAddEducation = () => { setEduForm({ degree: '', specialization: '', institution: '', passedOutYear: '' }); setEditingEducation(null); setEducationModalOpen(true); };
  const openEditEducation = (edu) => { setEduForm({ degree: edu.degree, specialization: edu.specialization, institution: edu.institution, passedOutYear: edu.passedOutYear }); setEditingEducation(edu); setEducationModalOpen(true); };
  const openEditSkills = () => {
    setNewSkill('');
    setLocalSkills(user?.skills ? [...user.skills] : []);
    setSkillsModalOpen(true);
  };

  const addSkillToLocal = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (localSkills.includes(s)) {
      setNewSkill('');
      return;
    }
    setLocalSkills((prev) => [...prev, s]);
    setNewSkill('');
  };

  const removeLocalSkill = (skill) => {
    setLocalSkills((prev) => prev.filter((s) => s !== skill));
  };

  const submitSkills = async () => {
    try {
      await updateSkills(localSkills).unwrap();
      Alert.alert('Success', 'Skills updated');
      setSkillsModalOpen(false);
    } catch (err) {
      console.error('Update skills error', err);
      Alert.alert('Error', err?.data?.message || err?.message || 'Failed to update skills');
    }
  };

  const submitEducation = async () => {
    const payload = { ...eduForm };
    try {
      if (editingEducation) {
        await updateEducation({ eduId: editingEducation._id || editingEducation.id, ...payload }).unwrap();
      } else {
        await addEducation(payload).unwrap();
      }
      setEducationModalOpen(false);
    } catch (err) {
      Alert.alert('Error', err?.data?.message || err?.message || 'Failed to save education');
    }
  };

  const handleDeleteEducation = (edu) => {
    Alert.alert('Delete Education', 'Delete this education record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteEducation(edu._id || edu.id).unwrap();
        } catch (err) {
          Alert.alert('Error', err?.data?.message || err?.message || 'Failed to delete education');
        }
      } }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickAvatar}>
          <Image
            source={{ uri: getFullAvatarUrl(user?.avatar) }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditPersonalInfo")}
        >
          <MaterialIcons name="edit" size={18} color="#2E5AAC" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <SectionHeader
          title="Contact Information"
          onEdit={() => navigation.navigate("EditPersonalInfo")}
        />

        <InfoRow label="Phone" value={user?.phone || ''} />
        <InfoRow label="Address" value={user?.address || ''} />
        <InfoRow label="Gender" value={user?.gender || ''} />
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <SectionHeader
          title="Experience"
          onEdit={() => navigation.navigate("EditProfessionalDetails")}
        />
        <InfoRow label="Total Experience" value={`${user?.experience ?? 0} years`} />
      </View>

      {/* Education */}
      <View style={styles.section}>
        <SectionHeader
          title="Education"
          onEdit={() => navigation.navigate("EditProfessionalDetails")}
        />

        <TouchableOpacity style={{ marginBottom: 8 }} onPress={openAddEducation}>
          <Text style={{ color: '#2E5AAC', fontWeight: '700', marginBottom: 8 }}>+ Add Education</Text>
        </TouchableOpacity>

        {(user?.education || []).map((ed, index) => (
          <View key={index} style={styles.educationCard}>
            <Text style={styles.eduDegree}>{ed.degree} - {ed.specialization}</Text>
            <Text style={styles.eduInst}>{ed.institution}</Text>
            <Text style={styles.eduYear}>Passed Out: {ed.passedOutYear}</Text>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity onPress={() => openEditEducation(ed)} style={{ marginRight: 12 }}>
                <MaterialIcons name="edit" size={18} color="#2E5AAC" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteEducation(ed)}>
                <MaterialIcons name="delete-outline" size={18} color="#E23B3B" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Education Modal */}
      <Modal visible={educationModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '90%', backgroundColor: '#fff', padding: 18, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>{editingEducation ? 'Edit Education' : 'Add Education'}</Text>
            <TextInput placeholder="Degree" value={eduForm.degree} onChangeText={(t) => setEduForm(v => ({...v, degree: t }))} style={styles.input} />
            <TextInput placeholder="Specialization" value={eduForm.specialization} onChangeText={(t) => setEduForm(v => ({...v, specialization: t }))} style={styles.input} />
            <TextInput placeholder="Institution" value={eduForm.institution} onChangeText={(t) => setEduForm(v => ({...v, institution: t }))} style={styles.input} />
            <TextInput placeholder="Passed Out Year" value={eduForm.passedOutYear} onChangeText={(t) => setEduForm(v => ({...v, passedOutYear: t }))} style={styles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setEducationModalOpen(false)} style={{ padding: 10 }}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitEducation} style={{ padding: 10 }}>
                <Text style={{ color: '#2E5AAC', fontWeight: '700' }}>{editingEducation ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Skills */}
      <View style={styles.section}>
        <SectionHeader
          title="Skills"
          onEdit={openEditSkills}
        />

        <View style={styles.skillsRow}>
          {(user?.skills || []).map((skill) => (
            <View style={styles.skillTag} key={skill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Skills Modal */}
      <Modal visible={skillsModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '92%', backgroundColor: '#fff', padding: 18, borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Edit Skills</Text>

            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <TextInput placeholder="Add skill" value={newSkill} onChangeText={setNewSkill} style={[styles.input, { flex: 1, marginRight: 8 }]} />
              <TouchableOpacity onPress={addSkillToLocal} style={{ backgroundColor: '#2E5AAC', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {localSkills.map((s) => (
                <View key={s} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E4ECFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: '#2E5AAC', fontWeight: '600', marginRight: 8 }}>{s}</Text>
                  <TouchableOpacity onPress={() => removeLocalSkill(s)}>
                    <MaterialIcons name="close" size={16} color="#2E5AAC" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setSkillsModalOpen(false)} style={{ padding: 10 }}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitSkills} style={{ padding: 10 }}>
                <Text style={{ color: '#2E5AAC', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Resume */}
      <View style={styles.section}>
        <SectionHeader
          title="Resume"
          onEdit={() => navigation.navigate("UploadResume")}
        />

        {user?.resumeUrl ? (
          <View>
            <View style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E6E8EB' }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Uploaded File:</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#222' }}>{getFileName(user.resumeUrl)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.resumeBtn} onPress={handleViewResume}>
                <Ionicons name="document-text-outline" size={22} color="#2E5AAC" />
                <Text style={styles.resumeText}>View Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.uploadResumeBtn, { backgroundColor: '#E23B3B' }]} onPress={handleDeleteResume} disabled={isDeleting}>
                {isDeleting ? (
                  <Ionicons name="refresh" size={18} color="#fff" />
                ) : (
                  <Text style={styles.uploadResumeText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadResumeBtn} onPress={() => navigation.navigate('UploadResume')}>
            <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
            <Text style={styles.uploadResumeText}>Upload Resume</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Job Preferences */}
      <View style={styles.section}>
        <SectionHeader
          title="Job Preferences"
          onEdit={() => navigation.navigate("JobPreferences")}
        />

        <InfoRow label="Preferred Roles" value={(user?.jobPreferences?.selectedRoles || []).join(", ")} />
        <InfoRow label="Location" value={user?.jobPreferences?.selectedLocation || ''} />
        <InfoRow label="Job Type" value={user?.jobPreferences?.jobType || ''} />
        <InfoRow label="Office Type" value={user?.jobPreferences?.officeType || ''} />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <SectionHeader
          title="Interested Categories"
          onEdit={() => navigation.navigate('Browse', { screen: 'BrowseRoot' })}
        />

        <View style={styles.skillsRow}>
          {(user?.selectedCategories || []).map((cat) => (
            <View style={styles.skillTag} key={cat}>
              <Text style={styles.skillText}>{cat}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/* COMPONENTS */
const SectionHeader = ({ title, onEdit }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={{ padding: 6, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="button"
    >
      <MaterialIcons name="edit" size={20} color="#2E5AAC" />
    </TouchableOpacity>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/* STYLES */
const styles = StyleSheet.create({
  container: { backgroundColor: "#F8F8FB", padding: 16 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },

  profileCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  profileImage: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: "#ddd",
  },
  name: { fontSize: 22, fontWeight: "700", marginTop: 10 },
  email: { color: "#6A6A6A", marginTop: 4 },

  editBtn: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#2E5AAC",
    alignItems: "center",
  },
  editText: { marginLeft: 6, color: "#2E5AAC", fontWeight: "600" },

  section: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },

  infoRow: {
    marginBottom: 8,
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 16, fontWeight: "600", color: "#222" },

  educationCard: { marginBottom: 12 },
  eduDegree: { fontSize: 16, fontWeight: "700" },
  eduInst: { fontSize: 14, color: "#666" },
  eduYear: { fontSize: 14, marginTop: 4 },

  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E4ECFF",
  },
  skillText: { color: "#2E5AAC", fontSize: 14 },

  resumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F0FF",
    padding: 10,
    borderRadius: 8,
  },
  resumeText: { marginLeft: 8, color: "#2E5AAC", fontWeight: "600" },

  uploadResumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E5AAC",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  uploadResumeText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "700",
  },
  input: {
    backgroundColor: '#F8F8FB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    marginBottom: 8,
  },
});

export default EmployeeProfileScreen;
