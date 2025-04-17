import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute, useNavigation } from "@react-navigation/native";


function MessagesPage({ onConversationPress }) {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const mockConversations = [
      { id: 1, name: "John Doe", lastMessage: "Hello there!", timestamp: Date.now() },
      { id: 2, name: "Jane Smith", lastMessage: "Good morning!", timestamp: Date.now() },
      { id: 3, name: "Alice", lastMessage: "How are you?", timestamp: Date.now() },
      { id: 4, name: "Bob", lastMessage: "Let's catch up soon", timestamp: Date.now() },
    ];

    setConversations(mockConversations);
  }, []);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />
        <Icon name="search" size={20} color="#C19A6B" style={styles.searchIcon} />
      </View>
      <ScrollView style={styles.conversationsList}>
        {filteredConversations.length === 0 ? (
          <Text>No conversations found</Text>
        ) : (
          filteredConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationItem}
              onPress={() => onConversationPress(conversation.id)}
            >
              <View style={styles.conversationContent}>
              onPress={() => navigation.navigate("messages/:conversationId")}
                <Icon name="user" size={40} color="#C19A6B" />
                <View style={styles.conversationText}>
                  <Text style={styles.conversationName}>{conversation.name}</Text>
                  <Text style={styles.conversationMessage}>
                    {conversation.lastMessage}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ConversationPage({ conversationId, onBackPress }) {
  return (
    <View style={styles.container}>
      <Text>Conversation ID: {conversationId}</Text>
      <TouchableOpacity onPress={onBackPress}>
        <Text style={{ color: "#C19A6B", fontSize: 16 }}>Go back to Messages</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("Messages");
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const handleConversationPress = (conversationId) => {
    setSelectedConversationId(conversationId);
    setCurrentPage("Conversation");
  };

  const handleBackPress = () => {
    setCurrentPage("Messages");
    setSelectedConversationId(null);
  };

  return (
    <View style={{ flex: 1 }}>
      {currentPage === "Messages" ? (
        <MessagesPage onConversationPress={handleConversationPress} />
      ) : (
        <ConversationPage conversationId={selectedConversationId} onBackPress={handleBackPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10, // تقليل الهامش السفلي
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C19A6B",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    width: "100%", // جعل عرض حقل البحث يملأ الشاشة
    marginBottom: 20, // إضافة هامش سفلي لحقل البحث
  },
  searchInput: {
    flex: 1,
    paddingLeft: 30,
    fontSize: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
  },
  conversationsList: {
    marginTop: 20,
  },
  conversationItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  conversationText: {
    marginLeft: 15,
  },
  conversationName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  conversationMessage: {
    fontSize: 14,
    color: "#555",
  },
});