import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../firebase/auth";
import { subscribeToUserConversations } from "../firebase/messages";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const MessagesPage = () => {
  const { user, profile } = useAuth();
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Subscribe to user conversations
    const unsubscribe = subscribeToUserConversations(user.uid, async (conversationsData) => {
      // Fetch profile info for each conversation's other user
      const conversationsWithProfiles = await Promise.all(
        conversationsData.map(async (conversation) => {
          try {
            const userRef = await getDoc(doc(db, 'users', conversation.otherUser.id));
            const profileRef = await getDoc(doc(db, 'users', conversation.otherUser.id, 'profile', 'profileInfo'));
            
            let userData = { role: conversation.otherUser.role };
            let profileData = { 
              name: conversation.otherUser.name,
              photoURL: conversation.otherUser.photoURL
            };
            
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
            
            // Ensure we have a valid photoURL by checking both sources
            const finalPhotoURL = profileData.photoURL || userData.photoURL || null;
            userData.photoURL = finalPhotoURL;
            profileData.photoURL = finalPhotoURL;

            return {
              ...conversation,
              otherUser: {
                ...conversation.otherUser,
                ...userData,
                ...profileData,
                photoURL: finalPhotoURL
              }
            };
          } catch (error) {
            console.error('Error fetching user profile:', error);
            return conversation;
          }
        })
      );

      setConversations(conversationsWithProfiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Group conversations by otherUser.id and keep only the most recent one
  const groupedConversations = conversations.reduce((acc, conversation) => {
    const existingConversation = acc.find(c => c.otherUser.id === conversation.otherUser.id);
    
    if (!existingConversation) {
      acc.push(conversation);
    } else if (conversation.timestamp > existingConversation.timestamp) {
      // Replace with more recent conversation
      const index = acc.findIndex(c => c.otherUser.id === conversation.otherUser.id);
      acc[index] = conversation;
    }
    
    return acc;
  }, []);
  
  // Filter conversations based on search term
  const filteredConversations = groupedConversations.filter((conversation) => {
    if (!searchTerm) return true;
    return conversation.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C19A6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#C19A6B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>
      
      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="envelope-o" size={40} color="#C19A6B" />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptyText}>
            {user.role === "client" 
              ? "Start a conversation with a designer by viewing their profile or proposal."
              : "Wait for clients to message you about their design needs."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          style={styles.conversationsList}
          renderItem={({ item: conversation }) => (
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => navigation.navigate('messages/:conversationId', { conversationId: conversation.id })}
              activeOpacity={0.7}
            >
              <View style={styles.conversationContent}>
                {conversation.otherUser.photoURL ? (
                  <Image
                    source={{ uri: conversation.otherUser.photoURL }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="user" size={24} color="#C19A6B" />
                  </View>
                )}
                
                <View style={styles.conversationText}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName} numberOfLines={1}>
                      {conversation.otherUser.name}
                    </Text>
                    <Text style={styles.timestamp}>
                      {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                    </Text>
                  </View>
                  
                  <View style={styles.messageRow}>
                    <Text style={styles.conversationMessage} numberOfLines={1}>
                      {conversation.lastMessageContent}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{conversation.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.roleText}>
                    {conversation.otherUser.role === "designer" ? "Designer" : "Client"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#333',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(193, 154, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationText: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#C19A6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 12,
    color: '#C19A6B',
    marginTop: 4,
  },
});

export default MessagesPage;