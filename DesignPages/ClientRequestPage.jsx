import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/auth";
import { uploadImage } from "../axios/axiosConfig";

const ClientRequestPage = () => {
  const { user } = useAuth();
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
        setImagePreview(result.assets[0].uri);
        // Create FormData for image upload
        const imageData = new FormData();
  imageData.append("file", imagePreview);
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
          referenceImageUrl = await uploadImage(imageFile);
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
        referenceImageUrl: referenceImageUrl,
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
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      let errorMessage = "An error occurred while submitting the request";
      if (err.code === "permission-denied") {
        errorMessage = "You do not have permission to perform this action";
      } else if (err.code === "unavailable") {
        errorMessage = "Service is currently unavailable. Please try again later";
      }
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    flexGrow: 1,
  },
  imagePicker: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: {
    color: "#555",
    fontSize: 14,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subHeading: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
  },
  button: {
    backgroundColor: "#C19A6B",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  success: {
    backgroundColor: "#D4EDDA",
    color: "#155724",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: "center",
  },
  error: {
    backgroundColor: "#F8D7DA",
    color: "#721C24",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingInline: 10,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
    
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555", 
  }
});

export default ClientRequestPage;