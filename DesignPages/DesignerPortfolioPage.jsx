import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";

function DesignerPortfolioPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { designer } = route.params || {};
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const proposalsRef = collection(db, 'designProposals');
        const q = query(
          proposalsRef,
          where('designerId', '==', designer.id),
          where('status', '==', 'completed')
        );

        const proposalsSnap = await getDocs(q);
        const projectsData = await Promise.all(proposalsSnap.docs.map(async (docu) => {
          const proposalData = docu.data();
          const requestRef = doc(db, 'designRequests', proposalData.requestId);
          const requestSnap = await getDoc(requestRef);

          // Get client profile
          const clientProfileRef = doc(db, 'users', proposalData.clientId, 'profile', 'profileInfo');
          const clientProfileSnap = await getDoc(clientProfileRef);
          const clientName = clientProfileSnap.exists()
            ? clientProfileSnap.data().name
            : 'Client';

          return {
            id: docu.id,
            ...proposalData,
            referenceImageUrl: requestSnap.exists()
              ? requestSnap.data().referenceImageUrl
              : '/project-placeholder.jpg',
            clientName,
            title: requestSnap.exists() ? requestSnap.data().title : 'Untitled Project',
            description: requestSnap.exists() ? requestSnap.data().description : '',
            roomType: requestSnap.exists() ? requestSnap.data().roomType : 'Room'
          };
        }));

        setProjects(projectsData);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (designer?.id) {
      fetchProjects();
    }
  }, [designer]);

  const filteredProjects = activeTab === "all"
    ? projects
    : projects.filter((project) => project.status === activeTab);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C19A6B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.coverPhoto}>
          <Image
            source={designer?.photoURL ? { uri: designer.photoURL } : require("../assets/person.gif")}
            style={styles.profileImage}
          />
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{designer?.name || "Unknown Designer"}</Text>
          
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>{designer?.rating?.toFixed(1) || "0.0"}</Text>
            <Text style={styles.ratingCount}>({designer?.ratingCount || 0} reviews)</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialIcons name="work" size={20} color="#666" />
              <Text style={styles.detailText}>{designer?.specialization || "Interior Design"}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="timer" size={20} color="#666" />
              <Text style={styles.detailText}>{designer?.experience || "Experience not specified"}</Text>
            </View>
          </View>

          <Text style={styles.bio}>{designer?.bio || "No bio available"}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate("messages", { recipientId: designer.id })}
            >
              <MaterialIcons name="chat" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate("client-request", { designerId: designer.id })}
            >
              <MaterialIcons name="edit" size={20} color="#C19A6B" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Request Design</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {['all', 'completed', 'in progress'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.projectsContainer}>
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>No projects to display</Text>
          </View>
        ) : (
          filteredProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              {project.referenceImageUrl && (
                <Image source={{ uri: project.referenceImageUrl }} style={styles.projectImage} />
              )}
              <View style={styles.projectInfo}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                {project.description && (
                  <Text style={styles.projectDescription}>{project.description}</Text>
                )}
                <View style={styles.projectDetails}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="room" size={16} color="#666" />
                    <Text style={styles.detailText}>{project.roomType || 'Room'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="person" size={16} color="#666" />
                    <Text style={styles.detailText}>{project.clientName}</Text>
                  </View>
                </View>
                {project.status === 'in progress' && (
                  <View style={styles.featuredBadge}>
                    <MaterialIcons name="timer" size={16} color="#4A90E2" />
                    <Text style={styles.featuredText}>In Progress</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  coverPhoto: {
    height: 120,
    backgroundColor: "#C19A6B",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFF",
    position: "absolute",
    bottom: -60,
  },
  profileInfo: {
    padding: 20,
    paddingTop: 70,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: "#718096",
    marginLeft: 4,
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 8,
  },
  bio: {
    fontSize: 14,
    color: "#4A5568",
    marginTop: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: "#C19A6B",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#C19A6B",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#C19A6B",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#C19A6B",
  },
  tabText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFF",
  },
  projectsContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#718096",
    marginTop: 16,
  },
  projectCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  projectImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
  },
  projectDescription: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    lineHeight: 20,
  },
  projectDetails: {
    flexDirection: "row",
    marginTop: 12,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  featuredText: {
    fontSize: 12,
    color: "#B7791F",
    marginLeft: 4,
  },
});

export default DesignerPortfolioPage;
