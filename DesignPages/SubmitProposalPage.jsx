import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { createNotification } from "../firebase/notifications";
import Icon from "react-native-vector-icons/FontAwesome";

function SubmitProposalPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { request } = route.params;
  const { user } = useAuth();
  
  const [proposalData, setProposalData] = useState({
    price: "",
    estimatedTime: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasProposed, setHasProposed] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    // Make sure user and request are available
    if (!user?.uid || !request?.id) return;
    
    const checkExistingProposal = async () => {
      try {
        const q = query(
          collection(db, "designProposals"),
          where("requestId", "==", request.id),
          where("designerId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        setHasProposed(!querySnapshot.empty);
      } catch (err) {
        console.error("Error checking existing proposal:", err);
      }
    };
    checkExistingProposal();
  }, [request?.id, user?.uid]);

  const handleChange = (name, value) => {
    setProposalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitProposal = async () => {
    if (request.status === "completed") {
      setError("Cannot submit proposal for a completed request.");
      return;
    }

    if (Number(proposalData.price) > Number(request.budget)) {
      setError(
        "Proposal price cannot exceed client's budget of $" +
          request.budget
      );
      return;
    }

    if (!proposalData.price || !proposalData.description || !proposalData.estimatedTime) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Add the proposal to Firestore
      const proposalRef = await addDoc(collection(db, "designProposals"), {
        requestId: request.id,
        designerId: user.uid,
        designerEmail: user.email,
        clientId: request.userId,
        title: request.title,
        price: proposalData.price,
        estimatedTime: proposalData.estimatedTime,
        description: proposalData.description,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Update the request status
      const requestRef = doc(db, "designRequests", request.id);
      await updateDoc(requestRef, {
        status: "pending"
      });

      // Create notification for the client
      await createNotification({
        userId: request.userId,
        title: "New Design Proposal",
        message: `A designer has submitted a proposal for your ${request.title} request.`,
        type: "info",
        relatedId: request.id
      });

      // Show success message
      Alert.alert(
        "Success", 
        "Your proposal has been submitted successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={20} color="#555" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {hasProposed ? "Proposal Already Submitted" : "Submit a Proposal"}
          </Text>
        </View>

        {error && (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>
              <Text style={styles.boldText}>Error!</Text> {error}
            </Text>
          </View>
        )}

        <ScrollView style={styles.scrollView}>
          <View style={styles.requestInfoContainer}>
            <Text style={styles.requestTitleLarge}>{request.title}</Text>
            <Text style={styles.requestDescription}>{request.description}</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Budget:</Text>
                <Text style={styles.infoValue}>${request.budget}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration:</Text>
                <Text style={styles.infoValue}>
                  {request.duration || "Not specified"} days
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Room Type:</Text>
                <Text style={styles.infoValue}>{request.roomType}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Client:</Text>
                <Text style={styles.infoValue}>{request.userEmail}</Text>
              </View>
            </View>
            
            {/* Reference Image Display */}
            {request.referenceImageUrl && (
              <View style={styles.referenceImageContainer}>
                <Text style={styles.referenceImageLabel}>Reference Image</Text>
                <TouchableOpacity
                  style={styles.referenceImageWrapper}
                  onPress={() => setZoomImage(request.referenceImageUrl)}
                >
                  <Image
                    source={{ uri: request.referenceImageUrl }}
                    style={styles.referenceImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Image Zoom Modal */}
          <Modal visible={!!zoomImage} transparent animationType="fade">
            <TouchableOpacity
              style={styles.zoomModalOverlay}
              activeOpacity={1}
              onPress={() => setZoomImage(null)}
            >
              <Image
                source={{ uri: zoomImage }}
                style={styles.zoomImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Modal>
          
          {hasProposed ? (
            <View style={styles.alreadyProposedContainer}>
              <Text style={styles.alreadyProposedText}>
                You have already submitted a proposal for this request. You cannot submit multiple proposals for the same request.
              </Text>
            </View>
          ) : request.status === "completed" ? (
            <View style={styles.completedRequestContainer}>
              <Text style={styles.completedRequestText}>
                This request has been completed. You can view it but cannot submit a proposal.
              </Text>
            </View>
          ) : (
            <View style={styles.proposalForm}>
              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Your Price (USD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your price"
                    keyboardType="numeric"
                    value={proposalData.price}
                    onChangeText={(value) => handleChange("price", value)}
                  />
                </View>
                
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Estimated Time (days)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter days"
                    keyboardType="numeric"
                    value={proposalData.estimatedTime}
                    onChangeText={(value) => handleChange("estimatedTime", value)}
                  />
                </View>
              </View>
              
              <Text style={styles.inputLabel}>Proposal Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Describe your approach, ideas, and why you're the right designer for this project..."
                multiline
                numberOfLines={4}
                value={proposalData.description}
                onChangeText={(value) => handleChange("description", value)}
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                  onPress={handleSubmitProposal}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Submit Proposal</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  // Alert styles
  errorAlert: {
    backgroundColor: "#fdeded",
    borderWidth: 1,
    borderColor: "#f9c0c0",
    padding: 12,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
  },
  errorAlertText: {
    color: "#c62828",
    fontSize: 14
  },
  boldText: {
    fontWeight: "bold"
  },
  requestInfoContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  requestTitleLarge: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333"
  },
  requestDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 12
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  // Reference image styles
  referenceImageContainer: {
    marginTop: 16
  },
  referenceImageLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555"
  },
  referenceImageWrapper: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd"
  },
  referenceImage: {
    width: "100%",
    height: "100%"
  },
  zoomModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center"
  },
  zoomImage: {
    width: "90%",
    height: "70%"
  },
  // Already proposed and completed request styles
  alreadyProposedContainer: {
    padding: 16,
    backgroundColor: "#fff9c4",
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  alreadyProposedText: {
    color: "#f57f17",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  completedRequestContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  completedRequestText: {
    color: "#757575",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  backToListButton: {
    backgroundColor: "#C19A6B",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backToListButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Form styles
  proposalForm: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  formColumn: {
    flex: 1,
    marginRight: 8,
    minWidth: 150,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#555"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14
  },
  submitButton: {
    backgroundColor: "#C19A6B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  disabledButton: {
    opacity: 0.7
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14
  },
});

export default SubmitProposalPage;
