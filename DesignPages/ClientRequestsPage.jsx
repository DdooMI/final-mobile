import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";

function ClientRequestsPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acceptedProposal, setAcceptedProposal] = useState(null);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch requests and proposals in parallel
      const requestsQuery = query(
        collection(db, "designRequests"),
        where("userId", "==", user.uid)
      );

      const [requestsSnapshot] = await Promise.all([
        getDocs(requestsQuery)
      ]);

      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt
          ? formatDistanceToNow(doc.data().createdAt.toDate(), { 
              addSuffix: true, 
              locale: enUS, 
              includeSeconds: true 
            })
          : "Unknown date",
        timestamp: doc.data().createdAt ? doc.data().createdAt.toDate().getTime() : 0
      }));

      // Sort by timestamp for better performance
      requestsData.sort((a, b) => b.timestamp - a.timestamp);

      setRequests(requestsData);

      // Fetch all proposals in parallel
      const proposalsPromises = requestsData.map(request =>
        getDocs(query(
          collection(db, "designProposals"),
          where("requestId", "==", request.id)
        ))
      );

      const proposalsSnapshots = await Promise.all(proposalsPromises);
      
      const proposalsData = {};
      proposalsSnapshots.forEach((snapshot, index) => {
        const requestId = requestsData[index].id;
        proposalsData[requestId] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt
            ? formatDistanceToNow(doc.data().createdAt.toDate(), {
                addSuffix: true,
                locale: enUS,
                includeSeconds: true
              })
            : "Unknown date"
        }));
      });

      setProposals(proposalsData);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", "Failed to fetch requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRequests();
    });

    fetchRequests();

    return () => unsubscribe();
  }, [navigation]);

  const handleAcceptProposal = (proposalId) => {
    setAcceptedProposal(proposalId);
    setStatus("accepted");
  };

  const handleRejectProposal = () => {
    setStatus("rejected");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("client-request")}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.box}
        data={requests}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchRequests}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.requestItem, selectedRequest?.id === item.id && styles.selectedItem]}
            onPress={() => navigation.navigate("request-details", { request: item, proposals: proposals[item.id] || [] })}
          >
            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>{item.title}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>budget: ${item.budget}</Text>
              <Text style={styles.detailText}>room: {item.roomType}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Posted: {item.createdAt}</Text>
              <Text style={styles.detailText}>
                {proposals[item.id]?.length || 0} Proposals
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#2D3748"
  },
  header: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 999
  },
  fab: {
    backgroundColor: "#C19A6B",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#C19A6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  messageText: { color: "#C19A6B", fontWeight: "600", fontSize: 15 },
  requestItem: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: "rgba(193, 154, 107, 0.05)",
    transform: [{ scale: 1.01 }],
    shadowColor: "#C19A6B",
    shadowOpacity: 0.2,
    elevation: 3
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  requestTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#2D3748",
    flex: 1
  },
  status: {
    fontSize: 13,
    color: "#C19A6B",
    backgroundColor: "rgba(193, 154, 107, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  description: {
    color: "#4A5568",
    marginVertical: 8,
    lineHeight: 20
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center"
  },
  detailText: {
    color: "#718096",
    fontSize: 13,
    fontWeight: "500"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16
  },
  proposalItem: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: "#C19A6B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#C19A6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  rejectButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#DC3545",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  messageButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C19A6B",
    marginTop: 12,
  },
  statusText: {
    fontWeight: "bold",
  },
  pending: {
    color: "orange",
  },
  accepted: {
    color: "green",
  },
  rejected: {
    color: "red",
  },
});

export default ClientRequestsPage;
