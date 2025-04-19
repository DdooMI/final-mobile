import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Animated,
  Alert,
  ScrollView
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  AntDesign,
  FontAwesome,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons"; // Added MaterialIcons
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../firebase/auth";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .max(15, "Password must not be more than 15 characters long")
    .required("Password is required"),
});

function Salah() {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current; // Animation value for rotation

  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
 

  const onSubmit = async (values, { setSubmitting, validateForm, setTouched, setFieldError }) => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setTouched({
        email: true,
        password: true
      });
      return;
    }

    setSubmitting(true);
    // Start spinning animation
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
    });
    setIsSubmitting(true);


    try {
      await login(values, navigation);
      setSubmitting(false);
    } catch (error) {
      if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'Incorrect email or password');
        setFieldError('email', 'Incorrect email or password');
        setTouched({ email: true });
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Incorrect email or password');
        setFieldError('password', 'Incorrect email or password');
        setTouched({ password: true });
      } else {
        Alert.alert('Error', error.message);
        setFieldError('password', error.message);
        setTouched({ password: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Interpolate spinValue to rotate from 0 to 360 degrees
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ImageBackground
      source={require("../assets/ff.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign In</Text>



        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          validateOnBlur={true}
          validateOnChange={true}
          validateOnMount={true}
        >
          {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            errors,
            touched,
          }) => (
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
              />
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>


              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.button}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View style={styles.buttonContent}>
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <MaterialIcons name="home" size={24} color="white" />
                    </Animated.View>
                    <Text style={styles.buttonText}>
                      Log In...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialIcons name="home" size={24} color="white" />
                    <Text style={styles.buttonText}>Log In</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', marginBottom: 20, justifyContent: 'center' }}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.socialTitle}>Other sign-in options</Text>
              <View style={styles.roleSection}>
                <Text style={styles.roleTitle}>Choose Your Role</Text>
                <Text style={styles.roleSubtitle}>Select your role before signing in</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[styles.roleButton, selectedRole === 'designer' && styles.selectedRole]}
                    onPress={() => setSelectedRole('designer')}
                  >
                    <MaterialIcons name="brush" size={24} color={selectedRole === 'designer' ? 'white' : '#dfb58e'} />
                    <Text style={[styles.roleButtonText, selectedRole === 'designer' && styles.selectedRoleText]}>Designer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleButton, selectedRole === 'client' && styles.selectedRole]}
                    onPress={() => setSelectedRole('client')}
                  >
                    <MaterialIcons name="person" size={24} color={selectedRole === 'client' ? 'white' : '#dfb58e'} />
                    <Text style={[styles.roleButtonText, selectedRole === 'client' && styles.selectedRoleText]}>Client</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => {
                    if (!selectedRole) {
                      Alert.alert('Error', 'Please select a role before signing in with Google');
                      return;
                    }
                  }}
                  
                  disabled={isSubmitting}
                >
                  <AntDesign name="google" size={24} color="red" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome name="facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Feather name="github" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
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
  // Update container dimensions and shadows to match SignupPage
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

  // Add matching subtitle styling
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

  // Update social buttons to match role buttons from SignupPage
  roleSection: {
    width: '100%',
    marginBottom: 20,
  },
  roleTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedRole: {
    backgroundColor: '#A67B5B',
    borderColor: '#A67B5B',
  },
  roleButtonText: {
    color: '#dfb58e',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedRoleText: {
    color: 'white',
  },
  socialButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 120,
    justifyContent: 'center',
  },

  // Add roleContent style for icon alignment
  roleContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  formContainer: {
    width: "100%",
  },
  // Update error message styling
  error: {
    color: "#FF6B6B",
    marginBottom: 12,
    fontSize: 14,
    textAlign: "left",
    paddingHorizontal: 5,
    marginTop: 4,
    minHeight: 20,
  },

  // Update input field styling to match SignupPage
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
  },

  // Update button styling for consistency
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

  // Add roleContent style matching SignupPage
  roleContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  forgotPassword: {
    color: "#FFD700",
    textAlign: "right",
    width: "100%",
    marginBottom: 10,
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
  signupText: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 15,
  },
  signupLink: {
    color: "#FFD700",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  socialTitle: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 15,
    fontSize: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  roleSection: {
    width: '100%',
    marginBottom: 20,
  },
  roleTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedRole: {
    backgroundColor: '#A67B5B',
    borderColor: '#A67B5B',
  },
  roleButtonText: {
    color: '#dfb58e',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedRoleText: {
    color: 'white',
  },
  socialButton: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '40%',
    transform: [{ translateY: -12 }],
  },
});

export default Salah;

