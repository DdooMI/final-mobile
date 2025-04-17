import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const mockNotifications = [
      { id: "1", title: "New Design Proposal", message: "A designer has submitted a proposal for your living request.", type: "info", read: false, time: "3 days ago" },
      { id: "2", title: "New Design Proposal", message: "A designer has submitted a proposal for your living request.", type: "info", read: true, time: "1 day ago" },
    ];
    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return false;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <Icon name="check-circle" size={20} color="green" />;
      case "warning":
        return <Icon name="exclamation-triangle" size={20} color="orange" />;
      case "error":
        return <Icon name="times-circle" size={20} color="red" />;
      case "info":
      default:
        return <Icon name="info-circle" size={20} color="blue" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("all")} style={[styles.tab, activeTab === "all" && styles.activeTab]}>
          <Text style={styles.tabText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("unread")} style={[styles.tab, activeTab === "unread" && styles.activeTab]}>
          <Text style={styles.tabText}>Unread</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.notificationItem, !item.read && styles.unreadNotification]}>
            {getNotificationIcon(item.type)}
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
            </View>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: "#C19A6B",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#FFF5E1",
  },
  notificationText: {
    flex: 1,
    marginLeft: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#555",
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
  },
});

export default NotificationsPage;
