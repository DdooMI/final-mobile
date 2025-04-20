import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const useBalance = create((set) => ({
  balance: 0,
  isLoading: false,
  error: null,

  fetchBalance: async (userId) => {
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const userDoc = doc(db, 'users', userId);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        set({ balance: userData.balance || 0, isLoading: false });
      } else {
        set({ balance: 0, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      set({ error: 'Failed to fetch balance', isLoading: false });
    }
  },

  updateBalance: async (userId, newBalance) => {
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      await updateDoc(doc(db, 'users', userId), {
        balance: newBalance
      });
      set({ balance: newBalance, isLoading: false });
    } catch (error) {
      console.error('Error updating balance:', error);
      set({ error: 'Failed to update balance', isLoading: false });
    }
  }
}));