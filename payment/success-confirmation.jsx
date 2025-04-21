import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const SuccessConfirmation = ({ operationType = 'deposit', amount = '50.00' }) => {
  const navigation = useNavigation()

  useEffect(() => {
    // Animation effect when component mounts
    // تم حذف استخدام document.getElementById لأنه غير مدعوم في React Native
  }, [])

  const isDeposit = operationType === 'deposit'
  const title = isDeposit ? 'Funds Added Successfully!' : 'Withdrawal Successful!'
  const message = isDeposit
    ? 'Your funds have been added to your balance successfully. You can now use your balance for purchases or future withdrawals.'
    : 'Your withdrawal has been processed successfully. The funds will be transferred to your PayPal account shortly.'

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.checkmarkContainer}>
          <Icon name="check-circle" style={styles.checkmark} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionLabel}>Transaction ID:</Text>
          <Text style={styles.transactionId}>TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</Text>
          <Text style={styles.transactionLabel}>Amount {isDeposit ? 'Added' : 'Withdrawn'}:</Text>
          <Text style={styles.amount}>${parseFloat(amount).toFixed(2)}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
            style={styles.viewBalanceButton}
          >
            <Text style={styles.buttonText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Main')}
            style={styles.returnHomeButton}
          >
            <Text style={styles.returnButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  checkmarkContainer: {
    backgroundColor: '#A67B5B',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    color: '#fff',
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#777',
    marginBottom: 24,
    textAlign: 'center',
  },
  transactionDetails: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 24,
  },
  transactionLabel: {
    fontSize: 14,
    color: '#777',
  },
  transactionId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    paddingTop: 16,
  },
  viewBalanceButton: {
    backgroundColor: '#A67B5B',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  returnHomeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  returnButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default SuccessConfirmation
