import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase/firebaseConfig";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '52639531068-qqvlqbqvvvvvvvvvvvvvvvvvvvvvvvvv.apps.googleusercontent.com', // Get this from your Firebase console
  offlineAccess: true,
});

export const useAuth = create((set, get) => ({
  user: null,
  token: "",
  role: null,
  profile: null,
  error: null,

  initialize: async () => {
    try {
      const [user, token, role, profile] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('role'),
        AsyncStorage.getItem('profile')
      ]);
      
      set({
        user: user ? JSON.parse(user) : null,
        token: token || "",
        role: role || null,
        profile: profile ? JSON.parse(profile) : null
      });
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
    }
  },

  clearError: () => set({ error: null }),

  signInWithGoogle: async (navigation, selectedRole) => {
    try {
      // Sign in with Google
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      const token = await user.getIdToken();

      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userRef, {
          email: user.email,
          role: selectedRole,
          emailVerified: true,
        });

        // Create profile document
        const profileRef = doc(db, "users", user.uid, "profile", "profileInfo");
        const profileData = {
          name: user.displayName || "",
          photoURL: user.photoURL || "",
        };
        await setDoc(profileRef, profileData);

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", selectedRole);
        await AsyncStorage.setItem("profile", JSON.stringify(profileData));

        set({
          user,
          token,
          role: selectedRole,
          profile: profileData,
          error: null,
        });
      } else {
        const userData = userSnap.data();
        const profileRef = doc(db, "users", user.uid, "profile", "profileInfo");
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists()
          ? profileSnap.data()
          : { name: user.displayName || "", photoURL: user.photoURL || "" };

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", userData.role);
        await AsyncStorage.setItem("profile", JSON.stringify(profileData));

        set({
          user,
          token,
          role: userData.role,
          profile: profileData,
          error: null,
        });
      }

      navigation.navigate('Main');
    } catch (err) {
      let errorMessage = "An error occurred during Google sign-in";

      if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid credentials. Please try again.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      }

      set({ error: errorMessage });
    }
  },

  login: async (data, navigation) => {
    try {
      const res = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )
      const user = res.user;
      
      if (!user.emailVerified) {
        set({ error: "Please verify your email before logging in." });
        return;
      }

      const token = await user.getIdToken();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      // Update email verification status in Firestore
      await updateDoc(userRef, {
        emailVerified: true
      });

      if (userSnap.exists()) {
        const userData = userSnap.data();

        const profileRef = doc(db, "users", user.uid, "profile", "profileInfo");
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists()
          ? profileSnap.data()
          : { name: "", photoURL: "" };

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", userData.role);
        await AsyncStorage.setItem("profile", JSON.stringify(profileData));

        set({
          user,
          token,
          role: userData.role,
          profile: profileData,
          error: null,
        });

       
        navigation.navigate('Main');
        
      } else {
        throw new Error("User role not found.");
      }
    } catch (err) {
      let errorMessage = "An error occurred during login";
      let errorCode = err.code;

      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        errorMessage = "Incorrect email or password";
        errorCode = "auth/wrong-password"; // Normalize error code
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      }

      set({ error: errorMessage });
      throw { code: errorCode, message: errorMessage };
    }
  },

  signUp: async (data, navigation) => {
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = res.user;
      
      // Send email verification
      await sendEmailVerification(user);

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        role: data.role,
        emailVerified: false,
      });

      const profileRef = doc(db, "users", user.uid, "profile", "profileInfo");
      const profileData = {
        name: data.username || "",
        photoURL: data.photoURL || "",
      };
      await setDoc(profileRef, profileData);

      set({ 
        user: null,
        token: null,
        role: null,
        profile: null,
        error: null
      });

      navigation.navigate('Login');
    } catch (err) {
      let errorMessage = "An error occurred during signup";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage =
          "Email/password accounts are not enabled. Please contact support";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters long and contain a mix of letters, numbers, and special characters";
      }

      set({ error: errorMessage });
    }
  },

  updateProfile: async (updatedProfile) => {
    try {
      const { user } = get();
      if (!user) throw new Error("User not logged in");

      const profileRef = doc(db, "users", user.uid, "profile", "profileInfo");
      await updateDoc(profileRef, updatedProfile);

      const newProfile = {
        ...get().profile,
        ...updatedProfile,
        name: updatedProfile.name || get().profile?.name || "",
        photoURL: updatedProfile.photoURL || get().profile?.photoURL || "",
      };

      await AsyncStorage.setItem("profile", JSON.stringify(newProfile));
      set({ profile: newProfile });
    } catch (err) {
      let errorMessage = "An error occurred during login";

      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format";
      } else if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      }

      set({ error: errorMessage });
    }
  },

  logout: async (navigation) => {
    await signOut(auth);

    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("profile");

    set({ user: null, token: "", role: null, profile: null, error: null });
    navigation.navigate('Login');
  },
}));
