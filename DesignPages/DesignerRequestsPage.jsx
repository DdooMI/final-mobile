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
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const { height } = Dimensions.get('window');

function DesignerRequestsPage() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("2");
  const [submittedProposals, setSubmittedProposals] = useState([]);

  useEffect(() => {
    const dummyRequests = [
      {
        id: "1",
        title: "make a simple office",
        description: "I need a simple office design",
        budget: 10,
        roomType: "office",
        status: "pending",
        createdAt: "Posted 5 days ago",
        clientEmail: "mohamed2@gmail.com"
      },
      {
        id: "2",
        title: "living room",
        description: "I need a living room design",
        budget: 10,
        roomType: "living room",
        status: "pending",
        createdAt: "Posted 4 days ago",
        clientEmail: "client2@example.com"
      },
    ];
    
    const dummyProposals = {
      "1": [],
      "2": [],
    };

    setRequests(dummyRequests);
    setProposals(dummyProposals);
  }, []);

  const handleSubmitProposal = (requestId) => {
    if (!price || !description) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const newProposal = {
      id: `p${Date.now()}`,
      designerEmail: "your-email@example.com",
      description,
      price: parseFloat(price),
      estimatedTime: parseInt(duration),
      status: "pending",
      createdAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
    };

    setProposals(prev => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), newProposal]
    }));

    setSubmittedProposals(prev => [...prev, requestId]);
    setPrice("");
    setDescription("");
    setDuration("2");

    Alert.alert("Success", "Your proposal has been submitted successfully");
    setSelectedRequest(null);
  };

  const hasSubmittedProposal = (requestId) => {
    return submittedProposals.includes(requestId);
  };

  return (
    <SafeAreaView style={styles.container}>  
      <View style={styles.box}>
        <Text style={styles.pageTitle}>Available Requests</Text>
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.requestItem, selectedRequest?.id === item.id && styles.selectedItem]}
              onPress={() => setSelectedRequest(item)}
            >
              <View style={styles.requestHeader}>
                <Text style={styles.requestTitle}>{item.title}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Budget: ${item.budget}</Text>
                <Text style={styles.detailText}>Posted: {item.createdAt}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Room: {item.roomType}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
     
      <Modal visible={!!selectedRequest} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.box, styles.modalContainer]}>
            {selectedRequest && (
              <>
                {hasSubmittedProposal(selectedRequest.id) ? (
                  <View style={styles.submittedContainer}>
                    <Text style={styles.submittedTitle}>You've already submitted a proposal for this request</Text>
                    <TouchableOpacity 
                      style={styles.button} 
                      onPress={() => setSelectedRequest(null)}
                    >
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.modalTitle}>Submit a Proposal</Text>
                    
                    <View style={styles.requestInfoContainer}>
                      <Text style={styles.requestTitleLarge}>{selectedRequest.title}</Text>
                      <Text style={styles.requestDescription}>{selectedRequest.description}</Text>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Budget:</Text>
                        <Text style={styles.infoValue}>${selectedRequest.budget}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Room Type:</Text>
                        <Text style={styles.infoValue}>{selectedRequest.roomType}</Text>
                      </View>
                      
                      <View style={styles.divider} />
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Duration:</Text>
                        <Text style={styles.infoValue}>{duration} days</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Client:</Text>
                        <Text style={styles.infoValue}>{selectedRequest.clientEmail}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.sectionTitle}>Your Price (USD)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your price"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                    />
                    
                    <Text style={styles.sectionTitle}>Proposal Description</Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      placeholder="Describe your approach, ideas, and why you're the right designer for this project..."
                      multiline
                      numberOfLines={4}
                      value={description}
                      onChangeText={setDescription}
                    />
                    
                    <Text style={styles.sectionTitle}>Estimated Time (days)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={duration}
                      onChangeText={setDuration}
                    />
                    
                    <TouchableOpacity 
                      style={styles.submitButton} 
                      onPress={() => handleSubmitProposal(selectedRequest.id)}
                    >
                      <Text style={styles.buttonText}>Submit Proposal</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={() => setSelectedRequest(null)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 16 },
  mainTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  pageTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  box: { backgroundColor: "#fff", padding: 16, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginTop: 16 },
  requestItem: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  selectedItem: { borderColor: "#C19A6B", backgroundColor: "#F7F1E1" },
  requestHeader: { flexDirection: "row", justifyContent: "space-between" },
  requestTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  status: { fontSize: 12, color: "#C19A6B" },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  detailText: { color: "#777", fontSize: 12 },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalContainer: { 
    width: "90%", 
    maxHeight: height * 0.85,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  requestInfoContainer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  requestTitleLarge: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  requestDescription: {
    color: "#555",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#555",
  },
  infoValue: {
    color: "#333",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 12,
  },
  sectionTitle: { 
    fontWeight: "bold", 
    marginTop: 12, 
    marginBottom: 6,
    color: "#555",
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 6, 
    padding: 10, 
    marginBottom: 12,
    backgroundColor: "#fff"
  },
  multilineInput: { 
    height: 100, 
    textAlignVertical: "top" 
  },
  button: { 
    backgroundColor: "#C19A6B", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    marginTop: 16 
  },
  submitButton: { 
    backgroundColor: "#C19A6B", 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    marginTop: 16 
  },
  cancelButton: { 
    padding: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    marginTop: 8 
  },
  cancelButtonText: { 
    color: "#777", 
    fontWeight: "bold" 
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  submittedContainer: { alignItems: "center", padding: 20 },
  submittedTitle: { 
    fontSize: 16, 
    textAlign: "center", 
    marginBottom: 20,
    color: "#4CAF50"
  },
});

export default DesignerRequestsPage;