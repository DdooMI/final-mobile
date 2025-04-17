import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

function ClientDesignersPage() {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const mockDesigners = [
      {
        id: "1",
        email: "designer1@example.com",
        name: "Designer One",
        photoURL: "https://scontent.fcai19-7.fna.fbcdn.net/v/t1.6435-9/192170697_3894578160595501_6205178212102252464_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=Jum3WTQq7j8Q7kNvgEZ1gsY&_nc_oc=Adm6tpTY_7-UCve1BbW6U8H-k_ZY3GHDhx431M0XT9VCKM51n-VEo1k7cJrlRnrZljQ&_nc_zt=23&_nc_ht=scontent.fcai19-7.fna&_nc_gid=x0jW8w2SO4CbwZRzG47Gcw&oh=00_AYFocdAsIOIKbm0cDEgBf4HkOCe1h1GIb8rRUcB8Drbvow&oe=6810C6C0",
        specialization: "Interior Design",
        experience: "5 years",
        bio: "Passionate about creating modern and stylish spaces.",
      },
      {
        id: "2",
        email: "designer2@example.com",
        name: "Designer Two",
        photoURL: "https://scontent.fcai19-7.fna.fbcdn.net/v/t1.6435-9/117168079_3066746570045335_6286471171469300030_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=hPL5mJdEUjwQ7kNvgH7ltBk&_nc_oc=AdnrMOK1-dR1Twa95xPWr3h8P4RLaLZtomVYhQTRGhBvKBfhwFjRtcSqyu5mcvpnQFA&_nc_zt=23&_nc_ht=scontent.fcai19-7.fna&_nc_gid=B3_DNyWxXGpYHPpiJRrH2w&oh=00_AYEeMrWwQ5xq84n44Wcv-ZNJ0-dJ8Ru_5I_gi2iN87JG7A&oe=6810D9DA",
        specialization: "Graphic Design",
        experience: "3 years",
        bio: "Expert in branding and digital designs.",
      }
    ];

    setTimeout(() => {
      setDesigners(mockDesigners);
      setLoading(false);
    }, 1000);
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
              <Image source={{ uri: item.photoURL }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
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
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#FFF", borderRadius: 8, padding: 16, marginBottom: 12, elevation: 3 },
  image: { width: "100%", height: 150, borderRadius: 8, resizeMode: "cover" },
  cardContent: { marginTop: 12 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "#666", marginBottom: 8 },
  button: { backgroundColor: "#C19A6B", padding: 10, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#FFF", fontWeight: "bold" }
});

export default ClientDesignersPage;
