import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, doc, updateDoc, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { formatDistanceToNow } from "date-fns";
import { useNotificationsStore } from "../zustand/notifications";

const NotificationsPage = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { initializeNotificationsListener } = useNotificationsStore();

  // Load notifications from Firebase
  useEffect(() => {
    if (!user) return;

    // Initialize the unread notifications counter
    initializeNotificationsListener(user.uid);
    
    // Get all notifications (both read and unread)
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt ? formatDistanceToNow(doc.data().createdAt.toDate(), { addSuffix: true }) : "Unknown time"
      }));
      setNotifications(notificationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, initializeNotificationsListener]);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return false;
  });

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <View style={styles.iconContainerGreen}><Icon name="check-circle" size={18} color="green" /></View>;
      case "warning":
        return <View style={styles.iconContainerYellow}><Icon name="exclamation-triangle" size={18} color="orange" /></View>;
      case "error":
        return <View style={styles.iconContainerRed}><Icon name="times-circle" size={18} color="red" /></View>;
      case "info":
      default:
        return <View style={styles.iconContainerBlue}><Icon name="info-circle" size={18} color="blue" /></View>;
    }
  };

  // Show loading indicator while fetching notifications
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C19A6B" />
      </View>
    );
  }

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      console.log("Notification clicked:", notification);
      
      // Mark notification as read if it's unread
      if (!notification.read) {
        const notificationRef = doc(db, "notifications", notification.id);
        await updateDoc(notificationRef, { read: true });
      }
      
      // Navigate to the appropriate screen based on notification type and related ID
      if (notification.relatedId) {
        // Check if it's a Project Completed notification
        if (notification.title === "Project Completed by Designer" || 
            notification.title === "Project Marked as Completed" || 
            notification.title === "Design Changes Requested") {
          // Navigate to the project screen
          navigation.navigate('project', { projectId: notification.relatedId });
        }
        // Check if it's any proposal-related notification for a designer
        else if (role === "designer" && notification.title.includes("Proposal")) {
          // Navigate to designer proposals screen
          navigation.navigate('designer-proposals', { proposalId: notification.relatedId });
        } else {
          // For clients or other notification types, navigate to client requests screen
          navigation.navigate('client-requests', { requestId: notification.relatedId });
        }
      }
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "unread" && styles.activeTab]}
          onPress={() => setActiveTab("unread")}
        >
          <Text style={[styles.tabText, activeTab === "unread" && styles.activeTabText]}>Unread</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.notificationItem, !item.read && styles.unreadNotification]}
            onPress={() => handleNotificationClick(item)}
          >
            <View style={styles.notificationRow}>
              {getNotificationIcon(item.type)}
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                {!item.read && (
                  <View style={styles.newBadgeContainer}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications found</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#C19A6B",
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: '#C19A6B',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: 'rgba(193, 154, 107, 0.05)',
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: 'flex-start',
  },
  iconContainerBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerYellow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#777",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    lineHeight: 20,
  },
  newBadgeContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  newBadgeText: {
    color: '#ff3b30',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: 'center',
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: 'center',
  },
});

export default NotificationsPage;
