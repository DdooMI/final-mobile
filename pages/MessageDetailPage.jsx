import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../firebase/auth";
import { useRoute, useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import {
  subscribeToConversationMessages,
  markMessagesAsRead,
  sendMessage,
} from "../firebase/messages";

const MessageDetailPage = () => {
  const { user, profile } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId } = route.params || {};
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    setLoading(true);

    // Subscribe to conversation messages
    const unsubscribe = subscribeToConversationMessages(
      conversationId,
      (messagesData) => {
        setMessages(messagesData);
        setLoading(false);

        // Extract other user info from the first message
        if (messagesData.length > 0) {
          const firstMessage = messagesData[0];
          const otherUserId =
            firstMessage.senderId === user.uid
              ? firstMessage.receiverId
              : firstMessage.senderId;

          // Set other user info and fetch their profile data
          setOtherUser({
            id: otherUserId,
          });
          
          // Fetch the other user's profile information
          const fetchOtherUserProfile = async () => {
            try {
              const userRef = await getDoc(doc(db, 'users', otherUserId));
              const profileRef = await getDoc(doc(db, 'users', otherUserId, 'profile', 'profileInfo'));
              
              let userData = { role: '' };
              let profileData = { name: 'User' };
              
              if (userRef.exists()) {
                const userDoc = userRef.data();
                userData = { 
                  ...userData,
                  ...userDoc,
                  photoURL: userDoc.photoURL || null
                };
              }
              
              if (profileRef.exists()) {
                const profileDoc = profileRef.data();
                profileData = {
                  ...profileData,
                  ...profileDoc,
                  photoURL: profileDoc.photoURL || userData.photoURL || null
                };
              }

              // Prioritize photoURL from profile, then user document
              const finalPhotoURL = profileData.photoURL || userData.photoURL || null;
              userData.photoURL = finalPhotoURL;
              profileData.photoURL = finalPhotoURL;
              
              setOtherUserProfile({
                ...userData,
                ...profileData,
                photoURL: finalPhotoURL
              });
            } catch (error) {
              console.error('Error fetching other user profile:', error);
            }
          };
          
          fetchOtherUserProfile();
        }

        // Mark messages as read
        markMessagesAsRead(conversationId, user.uid);
      }
    );

    return () => unsubscribe();
  }, [conversationId, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage({
        senderId: user.uid,
        receiverId: messages.length > 0
          ? (messages[0].senderId === user.uid
            ? messages[0].receiverId
            : messages[0].senderId)
          : otherUser?.id,
        content: newMessage,
        conversationId,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C19A6B" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#555" />
        </TouchableOpacity>
        
        {messages.length > 0 && otherUserProfile && (
          <View style={styles.userInfo}>
            {otherUserProfile.photoURL ? (
              <Image
                source={{ uri: otherUserProfile.photoURL }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={require("../assets/person.gif")}
                style={styles.avatar}
              />
            )}
            <View style={styles.userTextInfo}>
              <Text style={styles.userName}>{otherUserProfile.name || "User"}</Text>
              <Text style={styles.userRole}>
                {otherUserProfile.role === "designer" ? "Designer" : "Client"}
              </Text>
            </View>
          </View>
        )}
      </View>

      <FlatList
        ref={messagesEndRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[
            styles.messageRow,
            item.senderId === user.uid ? styles.userMessageRow : styles.otherMessageRow
          ]}>
            {/* Show avatar for messages from other user */}
            {item.senderId !== user.uid && otherUserProfile && (
              <View style={styles.messageSenderAvatar}>
                {otherUserProfile.photoURL ? (
                  <Image
                    source={{ uri: otherUserProfile.photoURL }}
                    style={styles.messageAvatar}
                  />
                ) : (
                  <Image
                    source={require("../assets/person.gif")}
                    style={styles.messageAvatar}
                  />
                )}
              </View>
            )}
            
            <View style={[
              styles.messageContainer,
              item.senderId === user.uid ? styles.userMessage : styles.otherMessage
            ]}>
              <Text style={[
                styles.messageText,
                item.senderId === user.uid ? styles.userMessageText : styles.otherMessageText
              ]}>
                {item.content}
              </Text>
              <Text style={[
                styles.timestamp,
                item.senderId === user.uid ? styles.userTimestamp : styles.otherTimestamp
              ]}>
                {formatDistanceToNow(item.createdAt, { addSuffix: true })}
              </Text>
            </View>
            
            {/* Show user's own avatar for their messages */}
            {item.senderId === user.uid && profile && (
              <View style={styles.messageSenderAvatar}>
                {profile.photoURL ? (
                  <Image
                    source={{ uri: profile.photoURL }}
                    style={styles.messageAvatar}
                  />
                ) : (
                  <Image
                    source={require("../assets/person.gif")}
                    style={styles.messageAvatar}
                  />
                )}
              </View>
            )}
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity 
          onPress={handleSendMessage} 
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="paper-plane" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 15, 
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: { 
    marginRight: 15,
    padding: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 10 
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: { 
    fontSize: 16, 
    fontWeight: "600",
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#C19A6B',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageSenderAvatar: {
    marginHorizontal: 5,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageAvatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: { 
    padding: 12, 
    borderRadius: 18, 
    maxWidth: "70%" 
  },
  userMessage: { 
    backgroundColor: "#C19A6B",
    borderTopRightRadius: 4,
    marginLeft: 40,
  },
  otherMessage: { 
    backgroundColor: "#f0f0f0", 
    borderTopLeftRadius: 4,
    marginRight: 40,
  },
  messageText: { 
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff"
  },
  otherMessageText: {
    color: "#333"
  },
  timestamp: { 
    fontSize: 11, 
    marginTop: 4 
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)"
  },
  otherTimestamp: {
    color: "#999"
  },
  inputContainer: { 
    flexDirection: "row", 
    padding: 12, 
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 20, 
    padding: 10, 
    paddingTop: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  sendButton: { 
    backgroundColor: "#C19A6B", 
    padding: 12, 
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d0b89c',
  },
});

export default MessageDetailPage;
