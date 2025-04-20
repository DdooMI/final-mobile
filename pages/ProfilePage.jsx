import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import UserBalance from "../payment/user-balance";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/auth";
import { axiosApi } from "../axios/axiosConfig";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, role, profile, updateProfile, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(profile?.name || "");
  const [newBio, setNewBio] = useState(profile?.bio || "");
  const [newSpecialization, setNewSpecialization] = useState(profile?.specialization || "");
  const [newExperience, setNewExperience] = useState(profile?.experience || "");
  const [imageFile, setImageFile] = useState();
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [designerRating, setDesignerRating] = useState({ averageRating: 0, ratingCount: 0 });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (role === 'designer' && user?.uid) {
      const fetchRating = async () => {
        try {
          const rating = await getDesignerRating(user.uid);
          setDesignerRating(rating);
        } catch (error) {
          console.error('Error fetching designer rating:', error);
          setDesignerRating({ averageRating: 0, ratingCount: 0 });
        }
      };
      fetchRating();
    }
  }, [user?.uid, role]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (role === 'designer' && user?.uid) {
        let statusFilter;
        if (activeTab === "completed") {
          statusFilter = ["completed"];
        } else if (activeTab === "in_progress") {
          statusFilter = ["accepted"];
        } else {
          statusFilter = ["completed", "accepted"];
        }

        const q = query(
          collection(db, 'designProposals'),
          where('designerId', '==', user.uid),
          where('status', 'in', statusFilter)
        );

        const querySnapshot = await getDocs(q);
        const projectsData = await Promise.all(querySnapshot.docs.map(async docu => {
          const proposalData = docu.data();
          const requestRef = doc(db, 'designRequests', proposalData.requestId);
          const requestSnap = await getDoc(requestRef);

          const clientProfileRef = doc(db, 'users', proposalData.clientId, 'profile', 'profileInfo');
          const clientProfileSnap = await getDoc(clientProfileRef);
          const clientName = clientProfileSnap.exists()
            ? clientProfileSnap.data().name
            : 'Client';

          return {
            id: docu.id,
            ...proposalData,
            referenceImageUrl: requestSnap.exists()
              ? requestSnap.data().referenceImageUrl
              : '/project-placeholder.jpg',
            clientName
          };
        }));

        setProjects(projectsData);
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [user?.uid, role, activeTab]);

  const handleFileChange = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        const fileName = imageUri.split('/').pop();
        const fileType = fileName.split('.').pop();

        const imageData = new FormData();
        imageData.append("file", {
          uri: imageUri,
          name: fileName,
          type: `image/${fileType}`
        });
        imageData.append("upload_preset", "home_customization");
        imageData.append("cloud_name", "dckwbkqjv");

        setImageFile(imageData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      if (!imageFile && newName === profile?.name && newBio === profile?.bio &&
        newSpecialization === profile?.specialization && newExperience === profile?.experience) {
        setEditMode(false);
        return;
      }

      let uploadedImageUrl = profile?.photoURL;

      if (imageFile) {
        try {
          const res = await axiosApi.post("", imageFile);
          uploadedImageUrl = res.data.secure_url;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Error', 'Failed to upload image. Please try again.');
          return;
        }
      }

      await updateProfile({
        name: newName,
        photoURL: uploadedImageUrl,
        bio: newBio,
        specialization: newSpecialization,
        experience: newExperience
      });

      setEditMode(false);
      setImageFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Navigation handlers for dropdown options
  const handleAboutUs = () => {
    setShowDropdown(false);
    navigation.navigate("About");
  };

  const handleContactUs = () => {
    setShowDropdown(false);
    navigation.navigate("Contact");
  };

  const handleOurService = () => {
    setShowDropdown(false);
    navigation.navigate("Services");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 150 }]}>
        <View style={styles.mainContent}>

          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  profile?.photoURL ? { uri: profile.photoURL } : require("../assets/person.gif")
                }
                style={styles.avatar}
              />
              {editMode && (
                <TouchableOpacity style={styles.imagePickerOverlay} onPress={handleFileChange}>
                  <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            {editMode ? (
              <>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Name"
                />
                <TextInput
                  style={styles.input}
                  value={newBio}
                  onChangeText={setNewBio}
                  placeholder="Bio"
                  multiline
                />
                {role === 'designer' && (
                  <>
                    <TextInput
                      style={styles.input}
                      value={newSpecialization}
                      onChangeText={setNewSpecialization}
                      placeholder="Specialization"
                    />
                    <TextInput
                      style={styles.input}
                      value={newExperience}
                      onChangeText={setNewExperience}
                      placeholder="Experience"
                    />
                  </>
                )}
                <TouchableOpacity style={styles.imagePicker} onPress={handleFileChange}>
                  <Text style={{ color: "#555" }}>Choose Image</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.name}>{profile?.name || "Unknown User"}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.bio}>{profile?.bio || "No bio available"}</Text>

                {role === 'designer' && (
                  <>
                    <View style={styles.ratingContainer}>
                      <MaterialIcons name="star" size={20} color="#FFD700" />
                      <Text style={styles.rating}>
                        {designerRating.averageRating.toFixed(1)}
                      </Text>
                      <Text style={styles.ratingCount}>
                        ({designerRating.ratingCount} reviews)
                      </Text>
                    </View>

                    <View style={styles.detailsContainer}>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="work" size={20} color="#666" />
                        <Text style={styles.detailText}>
                          {profile?.specialization || "Interior Design"}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialIcons name="timer" size={20} color="#666" />
                        <Text style={styles.detailText}>
                          {profile?.experience || "Experience not specified"}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{role?.charAt(0).toUpperCase() + role?.slice(1) || "User"}</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={editMode ? handleSave : () => setEditMode(true)}
            >
              <Text style={styles.buttonText}>
                {editMode ? "Save" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.balanceWrapper}>
            <UserBalance />
          </View>

          {role === 'designer' && (
            <>
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === "all" && styles.activeTab]}
                  onPress={() => setActiveTab("all")}
                >
                  <Text
                    style={[styles.tabText, activeTab === "all" && styles.activeText]}
                  >
                    All Projects
                  </Text>
                </TouchableOpacity>
              </View>

              {projects.length === 0 ? (
                <View style={styles.noProjectsContainer}>
                  <Text style={styles.noProjectsText}>No Projects Available</Text>
                </View>
              ) : (
                <View style={styles.projectsList}>
                  {/* قائمة المشاريع ستظهر هنا إذا وجدت */}
                </View>
              )}
            </>
          )}

        </View>
        <View style={[styles.bottomButtonsContainer, { position: 'absolute', bottom: 0 }]}>
          <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
            <Text style={styles.buttonText}>More About Us</Text>
          </TouchableOpacity>

          {showDropdown && (
            <View style={[styles.dropdownMenu, { bottom: 120 }]}>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleAboutUs}>
                <Text style={styles.dropdownText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleContactUs}>
                <Text style={styles.dropdownText}>Contact Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleOurService}>
                <Text style={styles.dropdownText}>Our Service</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
    backgroundColor: "#F9FAFB",
  },
  bottomButtonsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%"
  },
  dropdownContainer: {
    position: "relative",
    width: "100%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding:24,
    marginHorizontal: 16,
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    
    borderWidth: 4,
    borderColor: "#C19A6B",
    backgroundColor: "#F5F5F5",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  bio: {
    fontSize: 16,
    color: "#4A5568",
    textAlign: "center",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#FFF9F0",
    padding: 12,
    borderRadius: 16,
  },
  rating: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  detailsContainer: {
    marginBottom: 24,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailText: {
    fontSize: 16,
    color: "#4A5568",
    marginLeft: 12,
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    bottom: 60,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    width: 180,
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333333",
    letterSpacing: 0.3,
  },
  badge: {
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#C19A6B20",
    borderRadius: 20,
    alignSelf: "center",
  },
  badgeText: {
    color: "#C19A6B",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: "#C19A6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    width: "100%",
    fontSize: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  imagePicker: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    width: "100%",
  },
  balanceWrapper: {
    width: "90%",
    marginTop: 24,
    alignSelf: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    width: "90%",
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  activeTab: {
    backgroundColor: "#C19A6B20",
  },
  activeText: {
    color: "#C19A6B",
    fontWeight: "600",
  },
  noProjectsContainer: {
    marginTop: 24,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noProjectsText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  projectsList: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 24,
  },

  imagePickerOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    backgroundColor: '#C19A6B',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
  }

});

