import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { auth, db } from "../firebase/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);

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
    try {
      // Query users collection to find user by email
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        Alert.alert('Error', 'No account found with this email');
        return;
      }
      
      const userSnap = querySnapshot.docs[0];

      if (!userSnap.exists()) {
        Alert.alert('Error', 'No account found with this email');
        return;
      }

      const userData = userSnap.data();
      if (!userData.emailVerified) {
        Alert.alert('Error', 'Please verify your email before resetting password');
        setIsValid(false);
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
    }
  };

  return (
    <ImageBackground source={require("../assets/ff.jpg")} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        {message ? <Text style={styles.successMessage}>{message}</Text> : null}
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <View style={[styles.inputContainer, !isValid && styles.errorBorder]}>
         
          <TextInput
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setIsValid(true);
            }}
          />
        </View>
        {!isValid && <Text style={styles.errorText}>Please enter a valid email</Text>}

        <TouchableOpacity onPress={handleReset} style={styles.button} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToLogin}>
          <AntDesign name="arrowleft" size={16} color="white" />
          <Text style={styles.backToLoginText}> Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#6e5a46",
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    alignSelf: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  successMessage: {
    color: "#4CAF50",
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#A67B5B",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
  },
  backToLoginText: {
    color: "white",
    fontSize: 16,
  },
});

export default ForgotPassword;