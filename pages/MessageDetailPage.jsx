import React, { useState, useEffect, useRef } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { formatDistanceToNow } from "date-fns";

const MessageDetailPage = () => {
  const [messages, setMessages] = useState([
    { id: "1", senderId: "user", content: "Hello!", createdAt: new Date() },
    { id: "2", senderId: "other", content: "Hi there!", createdAt: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now().toString(), senderId: "user", content: newMessage, createdAt: new Date() },
    ]);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#555" />
        </TouchableOpacity>
        <Image
          source={require("../assets/favicon.png")}
          style={styles.avatar}
        />
        <Text style={styles.userName}>User Name</Text>
      </View>

      <FlatList
        ref={messagesEndRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.senderId === "user" ? styles.userMessage : styles.otherMessage
          ]}>
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.timestamp}>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Icon name="paper-plane" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff" },
  backButton: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontSize: 16, fontWeight: "bold" },
  messageContainer: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: "80%" },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#C19A6B" },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#ddd" },
  messageText: { color: "#fff" },
  timestamp: { fontSize: 10, color: "#eee", marginTop: 3 },
  inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, padding: 10, marginRight: 10 },
  sendButton: { backgroundColor: "#C19A6B", padding: 10, borderRadius: 20 },
});

export default MessageDetailPage;
