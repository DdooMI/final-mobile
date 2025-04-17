import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Check } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"

const SuccessConfirmation = ({ operationType = "deposit", amount = "50.00" }) => {
  const navigation = useNavigation()
  const [scale] = useState(new Animated.Value(0)) // Start with scale 0 for animation

  useEffect(() => {
    // Animate the checkmark to scale to 100% when the component mounts
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }, [scale])

  const isDeposit = operationType === "deposit"
  const title = isDeposit ? "Funds Added Successfully!" : "Withdrawal Successful!"
  const message = isDeposit 
    ? "Your funds have been added to your balance successfully. You can now use your balance for purchases or future withdrawals."
    : "Your withdrawal has been processed successfully. The funds will be transferred to your PayPal account shortly."

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.checkmarkContainer}>
          <Animated.View
            style={[
              styles.checkmark,
              {
                transform: [{ scale }],
              },
            ]}
          >
            <Check style={styles.checkIcon} />
          </Animated.View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.transactionInfo}>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionValue}>
              TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}
            </Text>
          </View>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>
              Amount {isDeposit ? "Added" : "Withdrawn"}:
            </Text>
            <Text style={styles.transactionValue}>${parseFloat(amount).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.viewBalanceButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.buttonText}>View Balance</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.returnHomeButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: "100%",
    maxWidth: 400,
    textAlign: "center",
  },
  checkmarkContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  checkmark: {
    width: 64,
    height: 64,
    backgroundColor: "#A67B5B",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 40,
    height: 40,
    color: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#6b6b6b",
    marginBottom: 20,
  },
  transactionInfo: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  transactionLabel: {
    color: "#6b6b6b",
  },
  transactionValue: {
    fontWeight: "bold",
  },
  buttons: {
    marginTop: 20,
  },
  viewBalanceButton: {
    backgroundColor: "#A67B5B",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  returnHomeButton: {
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
})

export default SuccessConfirmation
