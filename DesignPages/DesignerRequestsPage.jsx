import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
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

const { height, width } = Dimensions.get('window');

function DesignerRequestsPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "designRequests")
        );
        const querySnapshot = await getDocs(q);
        const requestsData = [];

        querySnapshot.forEach((doc) => {
          requestsData.push({
            id: doc.id,
            ...doc.data(),
            createdAtTimestamp: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
            createdAt: doc.data().createdAt
              ? formatDistanceToNow(doc.data().createdAt.toDate(), { addSuffix: true })
              : "Unknown date",
          });
        });

        // Sort requests from newest to oldest
        requestsData.sort((a, b) => {
          // Handle cases where createdAt might be null
          if (!a.createdAtTimestamp) return 1;
          if (!b.createdAtTimestamp) return -1;
          // Sort in descending order (newest first)
          return b.createdAtTimestamp - a.createdAtTimestamp;
        });

        setRequests(requestsData);
      } catch (err) {
        setError("Failed to load requests: " + err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRequestPress = (request) => {
    // Create a serializable version of the request object
    const serializableRequest = {
      ...request,
      // Convert any Date objects to strings
      createdAtTimestamp: request.createdAtTimestamp ? request.createdAtTimestamp.toString() : null,
      // Handle any other non-serializable values
      completedAt: request.completedAt ? {
        seconds: request.completedAt.seconds,
        nanoseconds: request.completedAt.nanoseconds
      } : null
    };
    
    navigation.navigate('SubmitProposal', { request: serializableRequest });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "pending":
        return styles.pendingBadge;
      case "accepted":
        return styles.acceptedBadge;
      case "rejected":
        return styles.rejectedBadge;
      case "completed":
        return styles.completedBadge;
      default:
        return styles.defaultBadge;
    }
  };
  
  const getStatusTextStyle = (status) => {
    switch (status) {
      case "pending":
        return styles.pendingText;
      case "accepted":
        return styles.acceptedText;
      case "rejected":
        return styles.rejectedText;
      case "completed":
        return styles.completedText;
      default:
        return styles.defaultText;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Client Design Requests</Text>
      
      {error && (
        <View style={styles.errorAlert}>
          <Text style={styles.errorAlertText}>
            <Text style={styles.boldText}>Error!</Text> {error}
          </Text>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C19A6B" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No design requests available at the moment.
          </Text>
        </View>
      ) : (
        <View style={styles.requestsContainer}>
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.requestsListContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.requestItem}
                onPress={() => handleRequestPress(item)}
              >
                <View style={styles.requestHeader}>
                  <Text style={styles.requestTitle}>{item.title}</Text>
                  <View style={getStatusBadgeStyle(item.status)}>
                    <Text style={getStatusTextStyle(item.status)}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.requestDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>Budget: ${item.budget}</Text>
                  <Text style={styles.detailText}>Room: {item.roomType}</Text>
                </View>
                <Text style={styles.postedText}>Posted {item.createdAt}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5", 
    padding: 16 
  },
  pageTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 16, 
    color: "#333" 
  },
  // Alert styles
  successAlert: {
    backgroundColor: "#e6f4ea",
    borderWidth: 1,
    borderColor: "#a8dab5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  successAlertText: {
    color: "#2e7d32",
    fontSize: 14
  },
  errorAlert: {
    backgroundColor: "#fdeded",
    borderWidth: 1,
    borderColor: "#f9c0c0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  errorAlertText: {
    color: "#c62828",
    fontSize: 14
  },
  boldText: {
    fontWeight: "bold"
  },
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  emptyContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  emptyText: {
    fontSize: 16,
    color: "#666"
  },
  // Main content grid
  contentGrid: {
    flex: 1,
    flexDirection: Platform.OS === "ios" ? "column" : width > 768 ? "row" : "column",
    gap: 16
  },
  // Requests list styles
  requestsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333"
  },
  requestsList: {
    flex: 1
  },
  requestsListContent: {
    paddingRight: 8
  },
  requestItem: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  selectedItem: {
    borderColor: "#C19A6B",
    backgroundColor: "rgba(193, 154, 107, 0.05)"
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8
  },
  // Status badge styles
  pendingBadge: {
    backgroundColor: "#fff9c4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  pendingText: {
    color: "#f57f17",
    fontSize: 12,
    fontWeight: "500"
  },
  acceptedBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  acceptedText: {
    color: "#2e7d32",
    fontSize: 12,
    fontWeight: "500"
  },
  rejectedBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  rejectedText: {
    color: "#c62828",
    fontSize: 12,
    fontWeight: "500"
  },
  completedBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  completedText: {
    color: "#1565c0",
    fontSize: 12,
    fontWeight: "500"
  },
  defaultBadge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  defaultText: {
    color: "#757575",
    fontSize: 12,
    fontWeight: "500"
  },
  requestDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  detailText: {
    fontSize: 13,
    color: "#777"
  },
  postedText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4
  },
  // Proposal container styles
  proposalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  requestInfoContainer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee"
  },
  requestTitleLarge: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333"
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12
  },
  infoItem: {
    width: "50%",
    marginBottom: 8
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
    marginTop: 8
  },
  alreadyProposedText: {
    color: "#f57f17",
    fontSize: 14
  },
  completedRequestContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginTop: 8
  },
  completedRequestText: {
    color: "#757575",
    fontSize: 14
  },
  // Form styles
  proposalForm: {
    marginTop: 8
  },
  formRow: {
    flexDirection: Platform.OS === "ios" ? "column" : width > 500 ? "row" : "column",
    marginBottom: 12,
    gap: 12
  },
  formColumn: {
    flex: 1
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
    color: "#333"
  },
  multilineInput: {
    height: 120,
    textAlignVertical: "top"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 12
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center"
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14
  },
  submitButton: {
    backgroundColor: "#C19A6B",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  // No selection state
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  noSelectionText: {
    color: "#999",
    fontSize: 15,
    textAlign: "center"
  }
});

export default DesignerRequestsPage;