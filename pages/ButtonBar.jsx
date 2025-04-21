import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { View, Text, StyleSheet } from "react-native";
import ProfileScreen from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import MessagesPage from "../pages/MessagesPage";
import DesignerProposalsPage from "../DesignPages/DesignerProposalsPage";
import ClientRequestsPage from "../DesignPages/ClientRequestsPage";
import ClientDesignersPage from "../DesignPages/ClientDesignersPage";
import DesignerRequestsPage from "../DesignPages/DesignerRequestsPage";
import AppBar from "../Components/AppBar";
import { useAuth } from "../firebase/auth";
import { useNotificationsStore } from "../zustand/notifications";
import { useMessagesStore } from "../zustand/messages";

const Tab = createBottomTabNavigator();

export default function ButtonBar() {
  const { role, user } = useAuth();
  const { unreadCount, initializeNotificationsListener } = useNotificationsStore();
  const { unreadCount: unreadMessageCount, initializeUnreadMessagesListener } = useMessagesStore();
  
  // Set up notifications listener when user changes
  useEffect(() => {
    let notificationsUnsubscribe;
    let messagesUnsubscribe;
    
    if (user && user.uid) {
      notificationsUnsubscribe = initializeNotificationsListener(user.uid);
      messagesUnsubscribe = initializeUnreadMessagesListener(user.uid);
    }
    
    return () => {
      if (notificationsUnsubscribe) notificationsUnsubscribe();
      if (messagesUnsubscribe) messagesUnsubscribe();
    };
  }, [user, initializeNotificationsListener, initializeUnreadMessagesListener]);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Notifications") {
            iconName = "notifications";
            // Return icon with badge for notifications
            return (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name={iconName} size={size} color={color} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === "Messages") {
            iconName = "message";
            // Return icon with badge for messages
            return (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name={iconName} size={size} color={color} />
                {unreadMessageCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === "My Proposals") {
            iconName = "description";
          } else if (route.name === "Design Requests") {
            iconName = "list";
          } else if (route.name === "Designers") {
            iconName = "group";
          } else if (route.name === "My Requests") {
            iconName = "list-alt";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#A67B5B",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
        header: () => <AppBar routeName={route.name} />,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          height: 60,
          paddingBottom: 5,
        },
      })}
    >
      
      {role === "designer" ? (
        <>
          <Tab.Screen
            name="Design Requests"
            component={DesignerRequestsPage}
          />
          <Tab.Screen name="My Proposals" component={DesignerProposalsPage} />
        </>
      ) : (
        <>
          <Tab.Screen name="My Requests" component={ClientRequestsPage} />
          <Tab.Screen name="Designers" component={ClientDesignersPage} />
          
        </>
      )}
      
      <Tab.Screen name="Messages" component={MessagesPage} />
      <Tab.Screen name="Notifications" component={NotificationsPage} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
