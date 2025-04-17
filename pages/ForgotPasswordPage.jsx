import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = () => {
    if (!validateEmail(email)) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
    setMessage("Reset link sent successfully!");
    setTimeout(() => setMessage(""), 3000);
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
          <AntDesign name="mail" size={20} color="#6e5a46" style={styles.icon} />
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