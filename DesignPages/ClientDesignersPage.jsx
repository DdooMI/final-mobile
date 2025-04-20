import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/auth";
import { getDesignerRating } from "../firebase/ratings";

function ClientDesignersPage() {
  const { user, role } = useAuth();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "designer")
        );
        const querySnapshot = await getDocs(q);
        const designersData = [];

        for (const docRef of querySnapshot.docs) {
          const designerData = docRef.data();

          // Get designer's profile info
          const profileRef = doc(db, "users", docRef.id, "profile", "profileInfo");
          const profileSnap = await getDoc(profileRef);
          let profileData = { name: "Designer", photoURL: "" };

          if (profileSnap.exists()) {
            profileData = profileSnap.data();
          }

          // Get designer's rating
          const rating = await getDesignerRating(docRef.id);

          designersData.push({
            id: docRef.id,
            email: designerData.email,
            name: profileData.name,
            photoURL: profileData.photoURL ,
            rating: rating.averageRating || 0,
            ratingCount: rating.ratingCount || 0
          });
        }

        // Sort designers by rating (highest first)
        const sortedDesigners = designersData.sort((a, b) => b.rating - a.rating);
        setDesigners(sortedDesigners);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigners();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#C19A6B" />
        </View>
      ) : (
        <FlatList
          data={designers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.photoURL ? <Image source={{ uri: item.photoURL }} style={styles.image} /> : <Image source={require("../assets/person.gif")} style={styles.image} />}
              <View style={styles.cardContent}>
                <View style={styles.nameRatingContainer}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>{item.rating.toFixed(1)} ⭐</Text>
                    <Text style={styles.ratingCount}>({item.ratingCount} reviews)</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("DesignerPortfolio", { designer: item })}
                >
                  <Text style={styles.buttonText}>View Portfolio</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nameRatingContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, color: "#666", marginRight: 4 },
  ratingCount: { fontSize: 12, color: "#999" },
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#FFF", borderRadius: 8, padding: 16, marginBottom: 12, elevation: 3 },
  image: { 
    width: "100%", 
    height: 150, 
    borderRadius: 8, 
    resizeMode: "contain", 
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },
  cardContent: { marginTop: 12 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "#666", marginBottom: 8 },
  button: { backgroundColor: "#C19A6B", padding: 10, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#FFF", fontWeight: "bold" }
});

export default ClientDesignersPage;
