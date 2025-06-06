import "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet, SafeAreaView } from "react-native";
import ButtonBar from "./pages/ButtonBar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SplashScreen from "./pages/SplashScreen";
import ClientRequestPage from "./DesignPages/ClientRequestPage";
import ClientDesignersPage from "./DesignPages/ClientDesignersPage";
import DesignerPortfolioPage from "./DesignPages/DesignerPortfolioPage";
import MessageDetailPage from "./pages/MessageDetailPage";
import MessagesPage from "./pages/MessagesPage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import DesignerRequestsPage from "./DesignPages/DesignerRequestsPage";
import SubmitProposalPage from "./DesignPages/SubmitProposalPage";
import ProjectDetails from "./pages/ProjectPage";
import PaymentPage from "./pages/PaymentPage";
import AppBar from "./Components/AppBar";
import ClientRequestsPage from "./DesignPages/ClientRequestsPage";
import RequestDetailsPage from "./DesignPages/RequestDetailsPage";


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="Login"
            component={LoginPage}
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupPage}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen name="Main" component={ButtonBar} />
          <Stack.Screen
            name="client-requests"
            component={ClientRequestsPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Client Requests" />,
            }}
          />
          <Stack.Screen
            name="client-request"
            component={ClientRequestPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Client Request" />,
            }}
          />
          <Stack.Screen
            name="client-designers"
            component={ClientDesignersPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Client Designers" />,
            }}
          />
          <Stack.Screen
            name="DesignerPortfolio"
            component={DesignerPortfolioPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Designer Portfolio" />,
            }}
          />
          <Stack.Screen
            name="messages/:conversationId"
            component={MessageDetailPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Message Detail" />,
            }}
          />
          <Stack.Screen
            name="messages"
            component={MessagesPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Messages" />,
            }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="designer-requests"
            component={DesignerRequestsPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Designer Requests" />,
            }}
          />
          <Stack.Screen
            name="ProjectPage"
            component={ProjectDetails}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Project Details" />,
            }}
          />
          <Stack.Screen
            name="payment"
            component={PaymentPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Payment" />,
            }}
          />
          <Stack.Screen
            name="request-details"
            component={RequestDetailsPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Request Details" />,
            }}
          />
          <Stack.Screen
            name="SubmitProposal"
            component={SubmitProposalPage}
            options={{
              headerShown: true,
              header: () => <AppBar routeName="Submit Proposal" />,
            }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:20
  },
});
