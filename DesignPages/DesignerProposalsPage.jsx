import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Drawer } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';

// صفحة MyProposalsScreen
export default function MyProposalsScreen() {
  const navigation = useNavigation();
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [filter, setFilter] = useState("All");
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const dummyProposals = [
      {
        id: "p1",
        title: "تصميم غرفة معيشة",
        description: "أنا مصمم محترف",
        price: 10,
        estimatedTime: 1,
        client: "ossamas",
        status: "pending",
        createdAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        request: {
          title: "living room",
          budget: 10,
          duration: 1,
          roomType: "living",
          postedAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        },
      },
      {
        id: "p2",
        title: "تصميم مكتب",
        description: "خبرة في تصميم المكاتب",
        price: 15,
        estimatedTime: 2,
        client: "client2",
        status: "accepted",
        createdAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        request: {
          title: "office",
          budget: 15,
          duration: 2,
          roomType: "office",
          postedAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        },
      },
      {
        id: "p3",
        title: "تصميم مطبخ عصري",
        description: "تصميم مميز لمطبخ عصري",
        price: 20,
        estimatedTime: 3,
        client: "client3",
        status: "rejected", // عرض مرفوض
        createdAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        request: {
          title: "modern kitchen",
          budget: 20,
          duration: 3,
          roomType: "kitchen",
          postedAt: formatDistanceToNow(new Date(), { addSuffix: true, locale: ar }),
        },
      },
    ];
    setProposals(dummyProposals);
  }, []);

  const filteredProposals = proposals.filter((proposal) =>
    filter === "All" ? true : proposal.status === filter.toLowerCase()
  );

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
          backgroundColor: "#99bbff", // لون أغمق من #ccdfff
          borderColor: "#3366cc",
          borderWidth: 1,
          borderRadius: 8,
        };
      case "rejected":
        return {
          backgroundColor: "#ff9999", // لون أغمق من #ffd6d6
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

  const getStatusTextColor = (status) => {
    switch (status) {
      case "pending":
        return { color: "#FFA500" };
      case "accepted":
        return { color: "#2e7d32" }; // أخضر أغمق شوية
      case "completed":
        return { color: "#003399" }; // أزرق غامق
      case "rejected":
        return { color: "#b30000" }; // أحمر غامق
      default:
        return { color: "#000" };
    }
  };

  const markAsCompleted = () => {
    const updated = proposals.map((p) =>
      p.id === selectedProposal.id ? { ...p, status: "completed" } : p
    );
    setProposals(updated);
    setSelectedProposal((prev) => ({ ...prev, status: "completed" }));
  };

  const handleNavigate = () => {
    if (selectedProposal) {
      // تنقل إلى صفحة المشروع باستخدام React Navigation
      navigation.navigate('ProjectPage', { proposal: selectedProposal });
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.drawerButton} onPress={() => setDrawerVisible(true)}>
        <Text style={styles.drawerButtonText}>Filter Options</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredProposals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.proposalItem, getStatusStyle(item.status)]}
            onPress={() => setSelectedProposal(item)}
          >
            <View style={styles.proposalContent}>
              <Text style={styles.proposalTitle}>{item.title}</Text>
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

      <Modal visible={drawerVisible} transparent animationType="slide">
        <View style={styles.drawerContainer}>
          <View style={styles.drawerContent}>
            <Text style={styles.drawerHeader}>Filter Proposals</Text>
            {["All", "Pending", "Accepted", "Rejected", "Completed"].map((item) => (
              <Drawer.Item
                key={item}
                label={item}
                active={filter === item}
                onPress={() => {
                  setFilter(item);
                  setDrawerVisible(false);
                }}
              />
            ))}
            <TouchableOpacity style={styles.closeDrawerButton} onPress={() => setDrawerVisible(false)}>
              <Text style={styles.closeDrawerButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedProposal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedProposal && (
              <>
                <Text style={styles.sectionTitle}>Proposal Details</Text>
                <View style={[styles.proposalItem, getStatusStyle(selectedProposal.status)]}>
                  <View style={styles.proposalContent}>
                    <Text style={styles.proposalTitle}>{selectedProposal.title}</Text>
                    <Text style={[styles.proposalStatus, getStatusTextColor(selectedProposal.status)]}>
                      {selectedProposal.status}
                    </Text>
                  </View>
                  <Text style={styles.proposalDescription}>{selectedProposal.description}</Text>
                  <View style={styles.proposalPriceTime}>
                    <Text style={styles.proposalDetail}>Price: ${selectedProposal.price}</Text>
                    <Text style={styles.proposalDetail}>Time: {selectedProposal.estimatedTime} days</Text>
                  </View>
                  <Text style={styles.proposalClient}>Client: {selectedProposal.client}</Text>
                  <Text style={styles.proposalCreatedAt}>Submitted: {selectedProposal.createdAt}</Text>
                </View>

                {selectedProposal.status === "accepted" && (
                  <TouchableOpacity style={styles.actionButton} onPress={markAsCompleted}>
                    <Text style={styles.actionButtonText}>✅ Mark as Completed</Text>
                  </TouchableOpacity>
                )}

                {(selectedProposal.status === "accepted" || selectedProposal.status === "completed") && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleNavigate}
                  >
                    <Text style={styles.actionButtonText}>🔍 View Project Page</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedProposal(null)}>
                  <Text style={styles.closeButtonText}>Close</Text>
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
  pageTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  drawerButton: { backgroundColor: "#c19a6b", padding: 10, borderRadius: 5, marginBottom: 16, alignSelf: 'flex-start' },
  drawerButtonText: { color: '#fff', fontWeight: 'bold' },
  drawerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  drawerContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  drawerHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  closeDrawerButton: { backgroundColor: '#c19a6b', padding: 10, borderRadius: 5, marginTop: 20, alignItems: 'center' },
  closeDrawerButtonText: { color: '#fff', fontWeight: 'bold' },
  proposalItem: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 },
  proposalContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  proposalTitle: { fontSize: 16, fontWeight: "bold" },
  proposalDescription: { color: "#555", marginVertical: 4 },
  proposalPriceTime: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  proposalDetail: { color: "#777", fontSize: 12 },
  proposalClient: { fontSize: 12, fontWeight: "bold", color: "#333", marginTop: 4 },
  proposalCreatedAt: { color: "#777", fontSize: 12, marginTop: 4 },
  proposalStatus: { fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#fff", padding: 16, borderRadius: 8, width: "90%" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  closeButton: { backgroundColor: "#c19a6b", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 16 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
  actionButton: { backgroundColor: "#c19a6b", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 10 },
  actionButtonText: { color: "#fff", fontWeight: "bold" },
});
