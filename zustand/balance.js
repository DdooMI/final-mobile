import { create } from 'zustand';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const useBalance = create((set, get) => ({
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
  },

  addFunds: async (userId, amount) => {
    if (!userId || isNaN(amount) || amount <= 0) return;
    
    set({ isLoading: true, error: null });
    try {
      const { balance } = get();
      const newBalance = balance + amount;
      await updateDoc(doc(db, 'users', userId), {
        balance: newBalance
      });
      set({ balance: newBalance, isLoading: false });
      return true;
    } catch (error) {
      console.error('Error adding funds:', error);
      set({ error: 'Failed to add funds', isLoading: false });
      return false;
    }
  },

  withdrawFunds: async (userId, amount) => {
    if (!userId || isNaN(amount) || amount <= 0) return;
    
    set({ isLoading: true, error: null });
    const { balance } = get();
    
    if (balance < amount) {
      set({ error: 'Insufficient balance for withdrawal', isLoading: false });
      return false;
    }
    
    try {
      const newBalance = balance - amount;
      await updateDoc(doc(db, 'users', userId), {
        balance: newBalance
      });
      set({ balance: newBalance, isLoading: false });
      return true;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      set({ error: 'Failed to withdraw funds', isLoading: false });
      return false;
    }
  }
}));