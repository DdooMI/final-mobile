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
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import UserBalance from "../payment/user-balance";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/auth";
import { axiosApi } from "../axios/axiosConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { getDesignerRating } from "../firebase/ratings";

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
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Fetch designer rating
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
    // Navigate to Our Service page
  };



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 150 }]}>
        <View style={styles.mainContent}>
          {showRatingModal && (
            <RatingDetailsModal
              isVisible={showRatingModal}
              onClose={() => setShowRatingModal(false)}
              rating={designerRating}
              designerId={user?.uid}
            />
          )}

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
                
              </>
            ) : (
              <>
                <Text style={styles.name}>{profile?.name || "Unknown User"}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.bio}>{profile?.bio || "No bio available"}</Text>

                {role === 'designer' && (
                  <>
                    <TouchableOpacity 
                      style={styles.ratingContainer}
                      onPress={() => setShowRatingModal(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <MaterialIcons
                            key={star}
                            name="star"
                            size={20}
                            color={star <= Math.round(designerRating.averageRating) ? "#FFD700" : "#E2E8F0"}
                          />
                        ))}
                      </View>
                      <Text style={styles.rating}>
                        {designerRating.averageRating.toFixed(1)}
                      </Text>
                      <Text style={styles.ratingCount}>
                        ({designerRating.ratingCount} {designerRating.ratingCount === 1 ? 'review' : 'reviews'})
                      </Text>
                    </TouchableOpacity>

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
                
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === "in_progress" && styles.activeTab]}
                  onPress={() => setActiveTab("in_progress")}
                >
                  <Text
                    style={[styles.tabText, activeTab === "in_progress" && styles.activeText]}
                  >
                    In Progress
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === "completed" && styles.activeTab]}
                  onPress={() => setActiveTab("completed")}
                >
                  <Text
                    style={[styles.tabText, activeTab === "completed" && styles.activeText]}
                  >
                    Completed
                  </Text>
                </TouchableOpacity>
              </View>

              {projects.length === 0 ? (
                <View style={styles.noProjectsContainer}>
                  <Text style={styles.noProjectsText}>No Projects Available</Text>
                </View>
              ) : (
                <View style={styles.projectsList}>
                  {loadingProjects ? (
                    <ActivityIndicator size="large" color="#C19A6B" style={{marginTop: 20}} />
                  ) : (
                    <View style={{paddingBottom: 20}}>
                      {projects.map(item => (
                        <TouchableOpacity 
                          key={item.id}
                          style={styles.projectCard}
                          onPress={() => navigation.navigate('ProjectPage', { proposalId: item.id })}
                        >
                          <Image 
                            source={{uri: item.referenceImageUrl || 'https://via.placeholder.com/150'}} 
                            style={styles.projectImage}
                          />
                          <View style={styles.projectBadge}>
                            <Text style={styles.projectBadgeText}>{item.status}</Text>
                          </View>
                          <View style={styles.projectInfo}>
                            <Text style={styles.projectTitle}>{item.title}</Text>
                            <Text style={styles.projectDescription} numberOfLines={2}>{item.description}</Text>
                            <View style={styles.projectMeta}>
                              <Text style={styles.projectPrice}>${item.price}</Text>
                              <Text style={styles.projectClient}>{item.clientName}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
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

// Rating Details Modal Component
const RatingDetailsModal = ({ isVisible, onClose, rating, designerId }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible && designerId) {
      setLoading(true);
      // Fetch ratings for this designer
      const ratingsRef = query(
        collection(db, 'ratings'),
        where('designerId', '==', designerId)
      );

      const unsubscribe = onSnapshot(ratingsRef, async (snapshot) => {
        const ratingsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Get client name
            const clientRef = doc(db, 'users', data.clientId, 'profile', 'profileInfo');
            const clientSnap = await getDoc(clientRef);
            const clientName = clientSnap.exists() ? clientSnap.data().name : 'Client';
            
            return {
              id: doc.id,
              ...data,
              clientName,
              createdAt: data.createdAt?.toDate?.() || new Date()
            };
          })
        );
        
        // Sort by date, newest first
        ratingsData.sort((a, b) => b.createdAt - a.createdAt);
        setRatings(ratingsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching ratings:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isVisible, designerId]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ratings & Reviews</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalRatingSummary}>
            <Text style={styles.modalRatingNumber}>{rating.averageRating.toFixed(1)}</Text>
            <View style={styles.modalStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name="star"
                  size={24}
                  color={star <= Math.round(rating.averageRating) ? "#FFD700" : "#E2E8F0"}
                />
              ))}
            </View>
            <Text style={styles.modalRatingCount}>
              Based on {rating.ratingCount} {rating.ratingCount === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          
          <ScrollView style={styles.modalRatingsList}>
            {loading ? (
              <ActivityIndicator size="large" color="#C19A6B" style={{marginTop: 20}} />
            ) : ratings.length > 0 ? (
              ratings.map((item) => (
                <View key={item.id} style={styles.ratingItem}>
                  <View style={styles.ratingItemHeader}>
                    <Text style={styles.ratingItemName}>{item.clientName}</Text>
                    <Text style={styles.ratingItemDate}>
                      {item.createdAt.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.ratingItemStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <MaterialIcons
                        key={star}
                        name="star"
                        size={16}
                        color={star <= item.rating ? "#FFD700" : "#E2E8F0"}
                      />
                    ))}
                  </View>
                  {item.comment && (
                    <Text style={styles.ratingItemComment}>{item.comment}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noRatingsText}>No reviews yet</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  modalRatingSummary: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalRatingNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#333",
  },
  modalStarsContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  modalRatingCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  modalRatingsList: {
    flex: 1,
  },
  ratingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  ratingItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ratingItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  ratingItemDate: {
    fontSize: 14,
    color: "#666",
  },
  ratingItemStars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  ratingItemComment: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noRatingsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
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
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  projectBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#C19A6B20',
  },
  projectBadgeText: {
    color: '#C19A6B',
    fontSize: 12,
    fontWeight: '600',
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C19A6B',
  },
  projectClient: {
    fontSize: 14,
    color: '#666666',
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

