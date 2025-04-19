import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import ProfileScreen from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import MessagesPage from "../pages/MessagesPage";
import DesignerProposalsPage from "../DesignPages/DesignerProposalsPage";
import ClientRequestsPage from "../DesignPages/ClientRequestsPage";
import ClientDesignersPage from "../DesignPages/ClientDesignersPage";
import DesignerRequestsPage from "../DesignPages/DesignerRequestsPage";
import AppBar from "../Components/AppBar";
import { useRoute } from "@react-navigation/native";
import {useAuth} from "../firebase/auth"
const Tab = createBottomTabNavigator();

export default function ButtonBar() {
  const {role} = useAuth()  // جلب الـ role من الـ params
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Notifications") {
            iconName = "notifications";
          } else if (route.name === "Messages") {
            iconName = "message";
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
