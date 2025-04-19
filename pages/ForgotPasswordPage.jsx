import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Alert,
  ScrollView,
  Animated
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = async () => {
    if (!validateEmail(email)) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    setIsSubmitting(true);
    
    // Start spinning animation
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
    });
    try {
      // Query users collection to find user by email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        Alert.alert('Error', 'No account found with this email');
        setIsSubmitting(false);
        return;
      }
      
      const userSnap = querySnapshot.docs[0];

      if (!userSnap.exists()) {
        Alert.alert('Error', 'No account found with this email');
        setIsSubmitting(false);
        return;
      }

      const userData = userSnap.data();
      if (!userData.emailVerified) {
        Alert.alert('Error', 'Please verify your email before resetting password');
        setIsValid(false);
        setIsSubmitting(false);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage("Reset link sent successfully! Please check your email.");
      setTimeout(() => {
        setMessage("");
        navigation.goBack();
      }, 3000);
    } catch (error) {
      let errorMessage = "An error occurred while sending the password reset email";

      if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many requests. Please try again later";
      }

      Alert.alert('Error', errorMessage);
      setIsValid(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ImageBackground source={require("../assets/ff.jpg")} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
          {message && <Text style={styles.successMessage}>{message}</Text>}

        <TextInput
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, !isValid && styles.errorBorder]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setIsValid(true);
          }}
        />
        {!isValid && <Text style={styles.error}>Please enter a valid email</Text>}

        <TouchableOpacity
          onPress={handleReset}
          style={styles.button}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.buttonContent}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <MaterialIcons name="home" size={24} color="white" />
              </Animated.View>
              <Text style={styles.buttonText}>Sending...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <MaterialIcons name="home" size={24} color="white" />
              <Text style={styles.buttonText}>Send Reset Link</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToLogin}>
          <AntDesign name="arrowleft" size={16} color="white" />
          <Text style={styles.backToLoginText}> Back to Login</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },
  container: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "rgba(110, 90, 70, 0.95)",
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: "100%",
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  error: {
    color: "#FF6B6B",
    marginBottom: 12,
    fontSize: 14,
    textAlign: "left",
    paddingHorizontal: 5,
    marginTop: 4,
    minHeight: 20,
    width: "100%",
  },
  successMessage: {
    color: "#4CAF50",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#A67B5B",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  backToLoginText: {
    color: "white",
    fontSize: 16,
  },
});

export default ForgotPassword;