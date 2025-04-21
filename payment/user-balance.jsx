import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAuth } from '../firebase/auth'
import { useBalance } from '../zustand/balance'

const UserBalance = () => {
  const { user } = useAuth()
  const { balance, fetchBalance, isLoading } = useBalance()
  const navigation = useNavigation()

  useEffect(() => {
    if (user && user.uid) {
      fetchBalance(user.uid)
    }
  }, [user, fetchBalance])

  const handleNavigateToPayment = () => {
    navigation.navigate('payment')
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Account Balance</Text>

        <View style={styles.balanceContainer}>
          <View style={styles.iconContainer}>
            <Icon name="wallet" style={styles.icon} />
          </View>
          <View>
            <Text style={styles.subtitle}>Available Balance</Text>
            <Text style={styles.balance}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#A67B5B" />
              ) : (
                `$${(balance || 0).toFixed(2)}`
              )}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleNavigateToPayment}
            style={styles.button}
          >
            <Icon name="wallet" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Manage Funds</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#F5EFE7',
    padding: 12,
    borderRadius: 50,
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
    color: '#A67B5B',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  buttonContainer: {
    marginTop: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#A67B5B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  buttonIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default UserBalance
