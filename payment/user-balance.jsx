import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Wallet } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"

const UserBalance = () => {
  const navigation = useNavigation()
  const balance = 250.75
  const isLoading = false

  const handleManageFunds = () => {
    navigation.navigate("payment") // تأكد من وجود شاشة Payment في الـ Navigator
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Balance</Text>

      <View style={styles.balanceRow}>
        <View style={styles.iconWrapper}>
          <Wallet size={24} color="#A67B5B" />
        </View>
        <View>
          <Text style={styles.label}>Available Balance</Text>
          <Text style={styles.amount}>
            ${isLoading ? "..." : balance.toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.manageFundsBtn} 
        onPress={handleManageFunds}
      >
        <Text style={styles.manageFundsText}>Manage Funds</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrapper: {
    backgroundColor: "#F5EFE7",
    padding: 12,
    borderRadius: 50,
    marginRight: 12,
  },
  label: {
    color: "#666",
    fontSize: 14,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  manageFundsBtn: {
    backgroundColor: "#A67B5B",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  manageFundsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default UserBalance