import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { createNotification } from "../firebase/notifications";

function RequestDetailsPage() {
    const route = useRoute();
    const navigation = useNavigation();
    const { request } = route.params;
    const [status, setStatus] = useState(request.status || "pending");
    const [acceptedProposal, setAcceptedProposal] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProposals = async () => {
        try {
            setLoading(true);
            setError(null);

            const proposalsQuery = query(
                collection(db, "designProposals"),
                where("requestId", "==", request.id)
            );

            const proposalsSnapshot = await getDocs(proposalsQuery);
            const proposalsData = await Promise.all(proposalsSnapshot.docs.map(async docu => {
                const proposalData = docu.data();

                // Fetch designer profile from users collection
                const clientProfileRef = doc(db, 'users', proposalData.designerId, 'profile', 'profileInfo');
                const clientProfileSnap = await getDoc(clientProfileRef);
                const profileData = clientProfileSnap.exists() ? clientProfileSnap.data() : {};
                const clientName = profileData.name || 'Client';
                const photoUrl = profileData.photoUrl;
                console.log("profileData", clientName, photoUrl);
                return {
                    id: docu.id,
                    ...proposalData,
                    designerName: clientName || proposalData.designerEmail,
                    photoUrl: photoUrl,
                    createdAt: proposalData.createdAt
                        ? formatDistanceToNow(proposalData.createdAt.toDate(), {
                            addSuffix: true,
                            locale: enUS,
                            includeSeconds: true
                        })
                        : "Unknown date",
                    timestamp: proposalData.createdAt ? proposalData.createdAt.toDate().getTime() : 0
                };
            }));

            // Sort proposals by timestamp (most recent first)
            proposalsData.sort((a, b) => b.timestamp - a.timestamp);
            setProposals(proposalsData);
        } catch (err) {
            setError(err.message);
            Alert.alert("Error", "Failed to fetch proposals: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProposals();
        });

        fetchProposals();

        return () => unsubscribe();
    }, [navigation]);

    const handleUpdateProposalStatus = async (proposalId, newStatus) => {
        if (!proposalId) return;
        setLoading(true);
        setError(null);

        try {
            const proposalRef = doc(db, "designProposals", proposalId);
            const proposalSnap = await getDoc(proposalRef);

            if (!proposalSnap.exists()) {
                throw new Error("Proposal not found");
            }

            const proposalData = proposalSnap.data();

            // Update proposal status
            await updateDoc(proposalRef, {
                status: newStatus,
            });

            // Create notification for designer
            await createNotification({
                userId: proposalData.designerId,
                title: `Proposal ${newStatus}`,
                message: newStatus === "accepted"
                    ? `Your proposal for "${request.title}" has been accepted by the client. You can now access the project page.`
                    : newStatus === "completed"
                        ? `Your proposal for "${request.title}" has been confirmed as completed by the client.`
                        : `Your proposal for "${request.title}" has been ${newStatus} by the client.`,
                type: newStatus === "accepted" || newStatus === "completed" ? "success" : "info",
                relatedId: proposalId,
            });

            // If accepting a proposal, initialize project status and update request status
            if (newStatus === "accepted") {
                await updateDoc(proposalRef, {
                    projectStatus: "in_progress",
                });

                // Update the request status to in_progress
                const requestRef = doc(db, "designRequests", request.id);
                await updateDoc(requestRef, {
                    status: "in_progress"
                });

                setAcceptedProposal(proposalId);
                setStatus("accepted");

                // Reject all other pending proposals
                const otherProposals = proposals.filter(
                    (p) => p.id !== proposalId && p.status === "pending"
                );

                for (const proposal of otherProposals) {
                    const otherProposalRef = doc(db, "designProposals", proposal.id);
                    await updateDoc(otherProposalRef, {
                        status: "rejected",
                    });

                    // Create notification for other designers
                    await createNotification({
                        userId: proposal.designerId,
                        title: "Proposal rejected",
                        message: `Another proposal has been accepted for "${request.title}".`,
                        type: "info",
                        relatedId: proposal.id,
                    });
                }
            } else if (newStatus === "rejected") {
                setStatus("rejected");
            }

            // Refresh proposals
            await fetchProposals();

        } catch (err) {
            setError(err.message);
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptProposal = (proposalId) => {
        handleUpdateProposalStatus(proposalId, "accepted");
    };

    const handleRejectProposal = (proposalId) => {
        handleUpdateProposalStatus(proposalId, "rejected");
    };

    const renderHeader = () => (
        <View style={styles.content}>
            <Text style={styles.requestTitle}>{request.title}</Text>
            <Text style={styles.description}>{request.description}</Text>
            <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Budget: ${request.budget}</Text>
                <Text style={styles.detailText}>Room: {request.roomType}</Text>
            </View>
            <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Duration: {request.duration}</Text>
                <Text style={styles.detailText}>
                    Status: <Text style={[styles.statusText, styles[status]]}>{status}</Text>
                </Text>
            </View>
            <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Posted: {request.createdAt}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={proposals}
                ListHeaderComponent={
                    <>
                        {renderHeader()}
                        <View style={styles.proposalsHeader}>
                            <Text style={styles.proposalsTitle}>Proposals</Text>
                            <Text style={styles.proposalsCount}>{proposals.length} proposals</Text>
                        </View>
                    </>
                }
                keyExtractor={(item) => item.id}
                refreshing={loading}
                onRefresh={fetchProposals}
                renderItem={({ item }) => (
                    <View style={styles.proposalItem}>
                        <View style={styles.proposalHeader}>
                            <View style={styles.designerInfo}>
                                <View style={styles.designerProfile}>
                                    {item.photoUrl ? (
                                        <Image 
                                            source={{ uri: item.photoUrl }} 
                                            style={styles.profileImage}
                                            defaultSource={require('../assets/person.gif')}
                                        />
                                    ) : (
                                        <Image 
                                            source={require('../assets/person.gif')} 
                                            style={styles.profileImage}
                                        />
                                    )}

                                    <Text style={styles.designerName}>{item.designerName || item.designerEmail}</Text>
                                </View>
                                <Text style={[styles.statusBadge, styles[`status_${item.status}`]]}>{item.status}</Text>
                            </View>
                            <Text style={styles.submissionDate}>Submitted {item.createdAt}</Text>
                        </View>

                        <Text style={styles.proposalDescription}>{item.description}</Text>

                        <View style={styles.proposalDetails}>
                            <View style={styles.detailBox}>
                                <Text style={styles.detailLabel}>Price</Text>
                                <Text style={styles.detailValue}>${item.price}</Text>
                            </View>
                            <View style={styles.detailBox}>
                                <Text style={styles.detailLabel}>Duration</Text>
                                <Text style={styles.detailValue}>{item.estimatedTime} days</Text>
                            </View>
                        </View>

                        {status === "pending" && item.status === "pending" && (
                            <View style={styles.actionContainer}>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAcceptProposal(item.id)}
                                >
                                    <Text style={styles.buttonText}>Accept Proposal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={() => handleRejectProposal(item.id)}
                                >
                                    <Text style={styles.buttonText}>Decline</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.messageButton}
                                    onPress={() => navigation.navigate("messages", { conversationId: item.id })}
                                >
                                    <Text style={styles.messageText}>Message Designer</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {item.status === "accepted" && (
                            <TouchableOpacity
                                style={styles.messageButton}
                                onPress={() => navigation.navigate("messages", { conversationId: item.id })}
                            >
                                <Text style={styles.messageText}>Message Designer</Text>
                            </TouchableOpacity>
                        )}
                    </View>
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
    content: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    proposalsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    proposalsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3748'
    },
    proposalsCount: {
        fontSize: 16,
        color: '#718096',
        fontWeight: '500'
    },
    requestTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2D3748",
        marginBottom: 12
    },
    description: {
        fontSize: 16,
        color: "#4A5568",
        lineHeight: 24,
        marginBottom: 16
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8
    },
    detailText: {
        fontSize: 15,
        color: "#718096"
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#2D3748",
        marginTop: 24,
        marginBottom: 16
    },
    proposalItem: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    proposalHeader: {
        marginBottom: 16
    },
    designerInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4
    },
    designerProfile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E2E8F0"
    },
    defaultProfileImage: {
        backgroundColor: "#E2E8F0"
    },
    designerName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2D3748"
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: "hidden",
        fontSize: 14,
        fontWeight: "500"
    },
    status_pending: {
        backgroundColor: "#FEF3C7",
        color: "#D97706"
    },
    status_accepted: {
        backgroundColor: "#D1FAE5",
        color: "#059669"
    },
    status_rejected: {
        backgroundColor: "#FEE2E2",
        color: "#DC2626"
    },
    submissionDate: {
        fontSize: 14,
        color: "#718096",
        fontStyle: "italic"
    },
    proposalDescription: {
        fontSize: 16,
        color: "#4A5568",
        lineHeight: 24,
        marginBottom: 16
    },
    proposalDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20
    },
    detailBox: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 4
    },
    detailLabel: {
        fontSize: 14,
        color: "#718096",
        marginBottom: 4
    },
    detailValue: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2D3748"
    },
    actionContainer: {
        gap: 12
    },
    acceptButton: {
        backgroundColor: "#C19A6B",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center"
    },
    rejectButton: {
        backgroundColor: "#EF4444",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center"
    },
    messageButton: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#C19A6B"
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600"
    },
    messageText: {
        color: "#C19A6B",
        fontSize: 16,
        fontWeight: "600"
    }
});

export default RequestDetailsPage;