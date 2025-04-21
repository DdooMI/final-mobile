import { create } from 'zustand';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const useNotificationsStore = create((set) => ({
  unreadCount: 0,
  
  // Initialize the listener for unread notifications
  initializeNotificationsListener: (userId) => {
    if (!userId) {
      set({ unreadCount: 0 });
      return () => {}; // Return empty cleanup function
    }
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    // Set up the listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      set({ unreadCount: snapshot.docs.length });
    });
    
    // Return the unsubscribe function for cleanup
    return unsubscribe;
  },
  
  // Reset the unread count
  resetUnreadCount: () => set({ unreadCount: 0 }),
}));
