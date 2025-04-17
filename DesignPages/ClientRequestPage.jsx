import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const ClientRequestPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    duration: "",
    roomType: "living",
    additionalDetails: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmitSuccess(true);
      setFormData({
        title: "",
        description: "",
        budget: "",
        duration: "",
        roomType: "living",
        additionalDetails: "",
      });
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 2000);
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
            value={formData.description}
            onChangeText={(value) => handleChange("description", value)}
          />
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
            value={formData.additionalDetails}
            onChangeText={(value) => handleChange("additionalDetails", value)}
          />
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
});

export default ClientRequestPage;