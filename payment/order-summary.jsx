import React, { useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react-native" // if using lucide-react-native
import { useAuth } from "../firebase/auth"
import { useBalance } from "../zustand/balance"

const OrderSummary = () => {
  const { user, role } = useAuth()
  const { balance, fetchBalance, isLoading } = useBalance()

  useEffect(() => {
    if (user && user.uid) {
      fetchBalance(user.uid)
    }
  }, [user, fetchBalance])

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Balance Summary</Text>

      {/* Balance Box */}
      <View style={styles.balanceBox}>
        <Wallet color="#A67B5B" size={32} />
        <Text style={styles.label}>Current Balance</Text>
        <Text style={styles.balance}>
          {isLoading ? <ActivityIndicator size="small" color="#A67B5B" /> : `$${balance.toFixed(2)}`}
        </Text>
        <Text style={styles.subText}>
          {role === "client"
            ? "Available for purchases and withdrawals"
            : "Available for withdrawals"}
        </Text>
      </View>

      {/* Operations Section */}
      <View style={styles.operationsContainer}>
        <Text style={styles.operationsHeading}>Account Operations</Text>
        {role === "client" ? (
          <>
            <OperationItem
              Icon={ArrowUpRight}
              title="Deposit"
              desc="Add funds to your balance using PayPal"
            />
            <OperationItem
              Icon={ArrowDownRight}
              title="Withdraw"
              desc="Transfer funds from your balance to PayPal"
            />
          </>
        ) : (
          <OperationItem
            Icon={ArrowDownRight}
            title="Withdraw"
            desc="Transfer funds from your balance to PayPal"
          />
        )}
      </View>

      {/* Security Info */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeTitle}>Secure Transactions</Text>
        <Text style={styles.noticeText}>
          All financial operations are processed securely through PayPal's payment system.
        </Text>
      </View>
    </View>
  )
}

const OperationItem = ({ Icon, title, desc }) => (
  <View style={styles.operationItem}>
    <View style={styles.iconWrapper}>
      <Icon color="#fff" size={16} />
    </View>
    <View>
      <Text style={styles.operationTitle}>{title}</Text>
      <Text style={styles.operationDesc}>{desc}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  balanceBox: {
    alignItems: "center",
    backgroundColor: "#F5EFE7",
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  balance: {
    fontSize: 28,
    fontWeight: "700",
    color: "#A67B5B",
    marginVertical: 8,
  },
  subText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  operationsContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 20,
  },
  operationsHeading: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  operationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 12,
  },
  iconWrapper: {
    backgroundColor: "#A67B5B",
    padding: 8,
    borderRadius: 999,
  },
  operationTitle: {
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 2,
  },
  operationDesc: {
    fontSize: 12,
    color: "#6B7280",
  },
  noticeBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 10,
  },
  noticeTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
    color: "#1D4ED8",
  },
  noticeText: {
    fontSize: 12,
    color: "#1D4ED8",
  },
})

export default OrderSummary
