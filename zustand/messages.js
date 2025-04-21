import { create } from 'zustand';
import { subscribeToUnreadMessageCount } from '../firebase/messages';

export const useMessagesStore = create((set) => ({
  unreadCount: 0,
  
  // Initialize the listener for unread messages
  initializeUnreadMessagesListener: (userId) => {
    if (!userId) {
      set({ unreadCount: 0 });
      return () => {}; // Return empty cleanup function
    }
    
    // Set up the listener for unread message count
    const unsubscribe = subscribeToUnreadMessageCount(userId, (count) => {
      set({ unreadCount: count });
    });
    
    // Return the unsubscribe function for cleanup
    return unsubscribe;
  },
  
  // Reset the unread count
  resetUnreadCount: () => set({ unreadCount: 0 }),
}));
