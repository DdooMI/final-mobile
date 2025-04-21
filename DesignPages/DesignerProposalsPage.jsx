import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, ActivityIndicator, ScrollView } from "react-native";
import { useAuth } from "../firebase/auth";
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { formatDistanceToNow } from "date-fns";

export default function DesignerProposalsPage() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [requestDetails, setRequestDetails] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [clientNames, setClientNames] = useState({});

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        // Get designer's proposals
        const q = query(
          collection(db, "designProposals"),
          where("designerId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const proposalsData = [];

        querySnapshot.forEach((doc) => {
          proposalsData.push({
            id: doc.id,
            ...doc.data(),
            createdAtTimestamp: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
            createdAt:
              doc.data().createdAt
                ? formatDistanceToNow(doc.data().createdAt.toDate(), { addSuffix: true })
                : "Unknown date",
          });
        });

        // Sort proposals from newest to oldest
        proposalsData.sort((a, b) => {
          // Handle cases where createdAt might be null
          if (!a.createdAtTimestamp) return 1;
          if (!b.createdAtTimestamp) return -1;
          // Sort in descending order (newest first)
          return b.createdAtTimestamp - a.createdAtTimestamp;
        });

        setProposals(proposalsData);

        // Check if there's a proposalId in the route params
        const proposalId = route.params?.proposalId;
        
        if (proposalId) {
          // Find the proposal with the matching ID
          const proposalToSelect = proposalsData.find(prop => prop.id === proposalId);
          if (proposalToSelect) {
            setSelectedProposal(proposalToSelect);
          }
        }

        // Get request details for each proposal
        const requestDetailsData = {};
        for (const proposal of proposalsData) {
          if (proposal.requestId) {
            const requestDoc = await getDoc(
              doc(db, "designRequests", proposal.requestId)
            );
            if (requestDoc.exists()) {
              const requestData = requestDoc.data();
              requestDetailsData[proposal.requestId] = {
                ...requestData,
                createdAt:
                  requestData.createdAt
                    ? formatDistanceToNow(requestData.createdAt.toDate(), { addSuffix: true })
                    : "Unknown date",
              };
            }
          }
        }

        setRequestDetails(requestDetailsData);

        // Get client names for each proposal
        const clientIds = proposalsData.map(proposal => proposal.clientId).filter(Boolean);
        const uniqueClientIds = [...new Set(clientIds)];
        const clientNamesData = {};

        for (const clientId of uniqueClientIds) {
          // Get client's profile info
          const profileRef = collection(db, "users", clientId, "profile");
          const profileSnap = await getDocs(profileRef);
          let clientName = "Client";

          if (!profileSnap.empty) {
            clientName = profileSnap.docs[0].data().name || "Client";
          }

          clientNamesData[clientId] = clientName;
        }

        setClientNames(clientNamesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user.uid]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter proposals based on status
  const filteredProposals =
    activeFilter === "all"
      ? proposals
      : proposals.filter((proposal) => proposal.status === activeFilter);

  // Helper function to get status style for React Native
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          backgroundColor: "#fff3e6",
          borderColor: "#FFA500",
          borderWidth: 1,
          borderRadius: 8,
        };
      case "accepted":
        return {
          backgroundColor: "#ccffe0",
          borderColor: "#4CAF50",
          borderWidth: 1,
          borderRadius: 8,
        };
      case "completed":
        return {
          backgroundColor: "#99bbff",
          borderColor: "#3366cc",
          borderWidth: 1,
          borderRadius: 8,
        };
      case "rejected":
        return {
          backgroundColor: "#ff9999",
          borderColor: "#cc0000",
          borderWidth: 1,
          borderRadius: 8,
        };
      default:
        return {
          borderRadius: 8,
        };
    }
  };

  // Helper function to get status text color for React Native
  const getStatusTextColor = (status) => {
    switch (status) {
      case "pending":
        return { color: "#FFA500" };
      case "accepted":
        return { color: "#2e7d32" };
      case "completed":
        return { color: "#003399" };
      case "rejected":
        return { color: "#b30000" };
      default:
        return { color: "#000" };
    }
  };

  // Function to handle navigation to project page
  const handleNavigateToProject = (proposalId) => {
    navigation.navigate('ProjectPage', { proposalId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Proposals</Text>
      
      <View style={styles.filterContainer}>
        <Text style={styles.subtitle}>
          Track the status of your design proposals submitted to clients
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "all" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text style={activeFilter === "all" ? styles.activeFilterText : styles.filterText}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "pending" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("pending")}
          >
            <Text style={activeFilter === "pending" ? styles.activeFilterText : styles.filterText}>
              Pending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "accepted" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("accepted")}
          >
            <Text style={activeFilter === "accepted" ? styles.activeFilterText : styles.filterText}>
              Accepted
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "rejected" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("rejected")}
          >
            <Text style={activeFilter === "rejected" ? styles.activeFilterText : styles.filterText}>
              Rejected
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "completed" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("completed")}
          >
            <Text style={activeFilter === "completed" ? styles.activeFilterText : styles.filterText}>
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            <Text style={styles.errorBold}>Error!</Text> {error}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C19A6B" />
        </View>
      ) : filteredProposals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {proposals.length === 0
              ? "You haven't submitted any design proposals yet."
              : "No proposals found with the selected filter."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProposals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.proposalItem, getStatusStyle(item.status)]}
              onPress={() => setSelectedProposal(item)}
            >
              <View style={styles.proposalHeader}>
                <Text style={styles.proposalTitle}>
                  {requestDetails[item.requestId]?.title || "Unknown Request"}
                </Text>
                <Text style={[styles.proposalStatus, getStatusTextColor(item.status)]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.proposalDescription}>{item.description}</Text>
              <View style={styles.proposalPriceTime}>
                <Text style={styles.proposalDetail}>Price: ${item.price}</Text>
                <Text style={styles.proposalDetail}>Time: {item.estimatedTime} days</Text>
              </View>
              <Text style={styles.proposalCreatedAt}>Submitted: {item.createdAt}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={!!selectedProposal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProposal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedProposal && (
              <ScrollView>
                <Text style={styles.sectionTitle}>Proposal Details</Text>
                <View style={[styles.proposalItem, getStatusStyle(selectedProposal.status)]}>
                  <View style={styles.proposalHeader}>
                    <Text style={styles.proposalTitle}>
                      {requestDetails[selectedProposal.requestId]?.title || "Unknown Request"}
                    </Text>
                    <Text style={[styles.proposalStatus, getStatusTextColor(selectedProposal.status)]}>
                      {selectedProposal.status}
                    </Text>
                  </View>
                  <Text style={styles.proposalDescription}>{selectedProposal.description}</Text>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Your Price:</Text>
                      <Text style={styles.detailValue}>${selectedProposal.price}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Estimated Time:</Text>
                      <Text style={styles.detailValue}>{selectedProposal.estimatedTime} days</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Client:</Text>
                      <Text style={styles.detailValue}>
                        {clientNames[selectedProposal.clientId] || "Unknown Client"}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Submitted:</Text>
                      <Text style={styles.detailValue}>{selectedProposal.createdAt}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.sectionSubtitle}>Request Information</Text>
                {requestDetails[selectedProposal.requestId] ? (
                  <View style={styles.requestInfoContainer}>
                    <Text style={styles.requestDescription}>
                      {requestDetails[selectedProposal.requestId].description}
                    </Text>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Budget:</Text>
                        <Text style={styles.detailValue}>
                          ${requestDetails[selectedProposal.requestId].budget}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Duration:</Text>
                        <Text style={styles.detailValue}>
                          {requestDetails[selectedProposal.requestId].duration} days
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Room Type:</Text>
                        <Text style={styles.detailValue}>
                          {requestDetails[selectedProposal.requestId].roomType}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Posted:</Text>
                        <Text style={styles.detailValue}>
                          {requestDetails[selectedProposal.requestId].createdAt}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noInfoContainer}>
                    <Text style={styles.noInfoText}>Request details not available</Text>
                  </View>
                )}

                {selectedProposal.status !== "rejected" && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setSelectedProposal(null);
                      handleNavigateToProject(selectedProposal.id);
                    }}
                  >
                    <Text style={styles.actionButtonText}>View Project Page</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedProposal(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f8f8", 
    padding: 16 
  },
  pageTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 16, 
    textAlign: "center",
    color: "#333"
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12
  },
  filterContainer: {
    marginBottom: 16
  },
  filterButtonsContainer: {
    flexDirection: "row",
    marginTop: 8
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 8
  },
  activeFilterButton: {
    backgroundColor: "#C19A6B"
  },
  filterText: {
    color: "#666",
    fontSize: 13
  },
  activeFilterText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold"
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: "#B71C1C"
  },
  errorBold: {
    fontWeight: "bold"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200
  },
  emptyContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center"
  },
  proposalItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  proposalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  proposalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1
  },
  proposalStatus: {
    fontSize: 12,
    fontWeight: "bold"
  },
  proposalDescription: {
    color: "#555",
    marginVertical: 4
  },
  proposalPriceTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4
  },
  proposalDetail: {
    color: "#777",
    fontSize: 12
  },
  proposalCreatedAt: {
    color: "#777",
    fontSize: 12,
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "90%",
    maxHeight: "80%"
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333"
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#333"
  },
  detailsGrid: {
    marginTop: 8
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  detailLabel: {
    color: "#666",
    fontSize: 14
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },
  requestInfoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8
  },
  requestDescription: {
    color: "#555",
    marginBottom: 12
  },
  noInfoContainer: {
    padding: 16,
    alignItems: "center"
  },
  noInfoText: {
    color: "#999"
  },
  actionButton: {
    backgroundColor: "#C19A6B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold"
  },
  closeButton: {
    backgroundColor: "#C19A6B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold"
  }
});


