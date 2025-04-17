import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

function ClientRequestsPage() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acceptedProposal, setAcceptedProposal] = useState(null);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const dummyRequests = [
      {
        id: "1",
        title: "تصميم غرفه نوم",
        description: "أحتاج إلى تصميم غرفه نوم.",
        budget: 100,
        roomType: "bed room",
        status: "pending",
        createdAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        duration: "3 أيام",
      },
      {
        id: "2",
        title: "تصميم ريسبيشن",
        description: "مطلوب تصميم ريسيبشن.",
        budget: 200,
        roomType: "hall",
        status: "completed",
        createdAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        duration: "5 أيام",
      },
    ];

    const dummyProposals = {
      "1": [
        {
          id: "p1",
          designerEmail: "designer1@example.com",
          description: "أنا مصمم محترف ويمكنني تنفيذ طلبك خلال يومين.",
          price: 90,
          estimatedTime: 2,
          status: "pending",
          createdAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        },
      ],
      "2": [],
    };

    setRequests(dummyRequests);
    setProposals(dummyProposals);
  }, []);

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
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("client-request")}>
          <Text style={styles.buttonText}>New Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <Text style={styles.pageTitle}>Your Requests</Text>
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
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>budget: ${item.budget}</Text>
                <Text style={styles.detailText}>room: {item.roomType}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Posted: {item.createdAt}</Text>
                <Text style={styles.detailText}>
                  {proposals[item.id]?.length || 0} عروض
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal visible={!!selectedRequest} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.box, styles.modalContainer]}>
            {selectedRequest && (
              <>
                <Text style={styles.requestTitle}>{selectedRequest.title}</Text>
                <Text style={styles.description}>{selectedRequest.description}</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>Budget: ${selectedRequest.budget}</Text>
                  <Text style={styles.detailText}>Room: {selectedRequest.roomType}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>Posted: {selectedRequest.createdAt}</Text>
                  <Text style={styles.detailText}>
                    Status: <Text style={[styles.statusText, styles[status]]}>{status}</Text>
                  </Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>Duration: {selectedRequest.duration}</Text>
                </View>
                <Text style={styles.pageTitle}>Proposals</Text>
                <FlatList
                  data={proposals[selectedRequest.id] || []}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.proposalItem}>
                      <Text style={styles.detailText}>Email: {item.designerEmail}</Text>
                      <Text style={styles.detailText}>Description: {item.description}</Text>
                      <Text style={styles.detailText}>Price: ${item.price}</Text>
                      <Text style={styles.detailText}>Time: {item.estimatedTime} days</Text>
                      <Text style={styles.detailText}>Status: {item.status}</Text>

                      {status === "pending" ? (
                        <View>
                          <View style={styles.buttonRow}>
                            <TouchableOpacity
                              style={styles.acceptButton}
                              onPress={() => handleAcceptProposal(item.id)}
                            >
                              <Text style={styles.buttonText}>✅ Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton} onPress={handleRejectProposal}>
                              <Text style={styles.buttonText}>❌ Reject</Text>
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity
                            style={[styles.messageButton, { marginTop: 10 }]}
                            onPress={() => {
                              setSelectedRequest(null);
                              navigation.navigate("messages", { conversationId: item.id });
                            }}
                          >
                            <Text style={styles.messageText}>💬 Message Designer</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}

                      {status === "accepted" && acceptedProposal === item.id ? (
                        <TouchableOpacity
                          style={[styles.messageButton, { marginTop: 10 }]}
                          onPress={() => {
                            setSelectedRequest(null);
                            navigation.navigate("messages", { conversationId: item.id });
                          }}
                        >
                          <Text style={styles.messageText}>💬 Message Designer</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  )}
                />
                <TouchableOpacity style={styles.button} onPress={() => setSelectedRequest(null)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 16 },
  pageTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  header: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  button: {
    backgroundColor: "#C19A6B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  messageText: { color: "#C19A6B", fontWeight: "bold", fontSize: 12 },
  box: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 16,
  },
  requestItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedItem: { borderColor: "#C19A6B", backgroundColor: "#F7F1E1" },
  requestHeader: { flexDirection: "row", justifyContent: "space-between" },
  requestTitle: { fontWeight: "bold", fontSize: 16 },
  status: { fontSize: 12, color: "#C19A6B" },
  description: { color: "#555", marginVertical: 4 },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  detailText: { color: "#777", fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: { width: "90%" },
  proposalItem: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: "#C19A6B",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C19A6B",
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
