import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/auth";
import { axiosApi } from "../axios/axiosConfig";
import * as FileSystem from 'expo-file-system';
import { useNavigation } from "@react-navigation/native";

const ClientRequestPage = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    duration: "",
    roomType: "",
    additionalDetails: "",
    referenceImageUrl: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setImagePreview(imageUri);
  
        // Get image info to get the file type
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
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

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.budget || !formData.duration || !formData.roomType) {
      setError("Please fill all required fields including project title, description, budget, duration and room type");
      return;
    }

    setIsSubmitting(true);
    try {
      let referenceImageUrl = "";
      if (imageFile) {
        try {
          referenceImageUrl = await axiosApi.post("", imageFile);
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
          return;
        }
      }

      await addDoc(collection(db, "designRequests"), {
        userId: user.uid,
        userEmail: user.email,
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        duration: formData.duration,
        roomType: formData.roomType,
        additionalDetails: formData.additionalDetails || "",
        referenceImageUrl: referenceImageUrl.data.secure_url,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitSuccess(true);
      setFormData({
        title: "",
        description: "",
        budget: "",
        duration: "",
        roomType: "",
        additionalDetails: "",
        referenceImageUrl: ""
      });
      setImageFile(null);
      setImagePreview(null);
      setTimeout(() => {
        setSubmitSuccess(false);
        navigation.navigate("Main");
      }, 3000);
    } catch (err) {
      let errorMessage = "An error occurred while submitting the request";
      if (err.code === "permission-denied") {
        errorMessage = "You do not have permission to perform this action";
      } else if (err.code === "unavailable") {
        errorMessage = "Service is currently unavailable. Please try again later";
      }
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      console.error("Error submitting design request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Submit a Design Request</Text>
        <Text style={styles.subHeading}>Tell us about your dream interior design project</Text>
        {submitSuccess && <Text style={styles.success}>Your design request has been submitted successfully.</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project title"
            value={formData.title}
            onChangeText={(value) => handleChange("title", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your project"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(value) => handleChange("description", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Room Type</Text>
          <View style={styles.pickerContainer}>
            <Dropdown
              data={[
                { label: "Select Room Type", value: "" },
                { label: "Living Room", value: "Living Room" },
                { label: "Bedroom", value: "Bedroom" },
                { label: "Kitchen", value: "Kitchen" },
                { label: "Bathroom", value: "Bathroom" },
                { label: "Home Office", value: "Home Office" },
                { label: "Other", value: "Other" },
              ]}
              labelField="label"
              valueField="value"
              itemTextStyle={styles.pickerText}
              placeholder="Select Room Type"
              value={formData.roomType}
              onChange={(item) => handleChange("roomType", item.value)}
              style={styles.picker}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Budget (USD)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter budget"
            value={formData.budget}
            onChangeText={(value) => handleChange("budget", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Duration (days)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter duration"
            value={formData.duration}
            onChangeText={(value) => handleChange("duration", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any extra details"
            multiline
            numberOfLines={4}
            value={formData.additionalDetails}
            onChangeText={(value) => handleChange("additionalDetails", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Reference Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>Choose Image</Text>
          </TouchableOpacity>
          {imagePreview && (
            <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? "Submitting..." : "Submit Request"}</Text>
        </TouchableOpacity>
  
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#F8F9FA",
    flexGrow: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 32,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#C19A6B",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  success: {
    backgroundColor: "#C6F6D5",
    color: "#2F855A",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    textAlign: "center",
    fontSize: 16,
  },
  error: {
    backgroundColor: "#FED7D7",
    color: "#C53030",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    textAlign: "center",
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 16,
    color: "#4A5568",
  },
  imagePicker: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  imagePickerText: {
    color: "#4A5568",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  }
});

export default ClientRequestPage;