import React from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react-native"

const OrderSummary = () => {
  // بيانات ثابتة
  const balance = 1000.00
  const isLoading = false
  const role = "client" // أو "admin"

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Balance Summary</Text>

      {/* Current Balance Section */}
      <View style={styles.balanceContainer}>
        <View style={styles.iconContainer}>
          <Wallet style={styles.walletIcon} />
        </View>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#A67B5B" />
          ) : (
            `$${balance.toFixed(2)}`
          )}
        </Text>
        <Text style={styles.balanceDescription}>
          {role === "client"
            ? "Available for purchases and withdrawals"
            : "Available for withdrawals"}
        </Text>
      </View>

      {/* Operation Info */}
      <View style={styles.operationsContainer}>
        <Text style={styles.operationsHeader}>Account Operations</Text>
        
        {role === "client" ? (
          <>
            <View style={styles.operationItem}>
              <View style={styles.operationIconContainer}>
                <ArrowUpRight style={styles.operationIcon} />
              </View>
              <View>
                <Text style={styles.operationTitle}>Deposit</Text>
                <Text style={styles.operationDescription}>Add funds to your balance using PayPal</Text>
              </View>
            </View>
            
            <View style={styles.operationItem}>
              <View style={styles.operationIconContainer}>
                <ArrowDownRight style={styles.operationIcon} />
              </View>
              <View>
                <Text style={styles.operationTitle}>Withdraw</Text>
                <Text style={styles.operationDescription}>Transfer funds from your balance to PayPal</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.operationItem}>
            <View style={styles.operationIconContainer}>
              <ArrowDownRight style={styles.operationIcon} />
            </View>
            <View>
              <Text style={styles.operationTitle}>Withdraw</Text>
              <Text style={styles.operationDescription}>Transfer funds from your balance to PayPal</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.secureTransactionsContainer}>
        <Text style={styles.secureTransactionsHeader}>Secure Transactions</Text>
        <Text style={styles.secureTransactionsDescription}>
          All financial operations are processed securely through PayPal's payment system.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  balanceContainer: {
    padding: 16,
    backgroundColor: "#F5EFE7",
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  walletIcon: {
    width: 32,
    height: 32,
    color: "#A67B5B",
  },
  balanceLabel: {
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#A67B5B",
    marginBottom: 8,
  },
  balanceDescription: {
    fontSize: 12,
    color: "#4B5563",
  },
  operationsContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 24,
  },
  operationsHeader: {
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "center",
  },
  operationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  operationIconContainer: {
    backgroundColor: "#A67B5B",
    padding: 8,
    borderRadius: 9999,
    marginRight: 12,
  },
  operationIcon: {
    color: "white",
    width: 16,
    height: 16,
  },
  operationTitle: {
    fontWeight: "500",
  },
  operationDescription: {
    fontSize: 12,
    color: "#4B5563",
  },
  secureTransactionsContainer: {
    backgroundColor: "#E0F2FE",
    padding: 12,
    borderRadius: 8,
  },
  secureTransactionsHeader: {
    fontWeight: "500",
    marginBottom: 8,
    color: "#1D4ED8",
  },
  secureTransactionsDescription: {
    fontSize: 12,
    color: "#1D4ED8",
  },
})

export default OrderSummary
