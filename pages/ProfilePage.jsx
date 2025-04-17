import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import UserBalance from "../payment/user-balance";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

export default function ProfileScreen() {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("sayed");
  const [email] = useState("latifosama300@gmail.com");
  const [imageUri, setImageUri] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
  const navigation = useNavigation(); // Hook for navigation

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      console.log("User logged out");
      // Add your logout logic here, e.g.:
      // await auth().signOut();
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'Login' }],
      // });
    } catch (error) {
      console.error("Logout error:", error);
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Top Buttons Container */}
      <View style={styles.topButtonsContainer}>
        {/* Log Out Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>

        {/* About Us Button with Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
            <Text style={styles.buttonText}> More About Us</Text>
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleAboutUs}
              >
                <Text style={styles.dropdownText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleContactUs}
              >
                <Text style={styles.dropdownText}>Contact Us</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleOurService}
              >
                <Text style={styles.dropdownText}>Our Service</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Image
          source={
            imageUri ? { uri: imageUri } : require("../assets/person.gif")
          }
          style={styles.avatar}
        />

        {editMode ? (
          <>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={{ color: "#555" }}>Choose Image</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.name}>{name}</Text>
        )}

        <Text style={styles.email}>{email}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Designer</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    backgroundColor: "#F9FAFB",
  },
  topButtonsContainer: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row", // Align buttons horizontally
    alignItems: "center",
    marginBottom: 10,
  },
  dropdownContainer: {
    position: "relative",
    marginLeft: 10, // Space between Log Out and About Us buttons
  },
  dropdownMenu: {
    position: "absolute",
    top: 50, // Adjust based on button height
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: 150,
    zIndex: 1000, // Ensure dropdown appears above other elements
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  badge: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#A67B5B20",
    borderRadius: 20,
  },
  badgeText: {
    color: "#A67B5B",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#A67B5B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    fontSize: 18,
    marginVertical: 10,
    padding: 6,
  },
  imagePicker: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  balanceWrapper: {
    width: "90%",
    marginTop: 20,
    alignSelf: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    width: "90%",
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "center",
  },
  tabBtn: {
    marginRight: 16,
    paddingBottom: 6,
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#A67B5B",
  },
  activeText: {
    color: "#A67B5B",
  },
  noProjectsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
  },
  noProjectsText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
  projectsList: {
    marginTop: 20,
  },
});
