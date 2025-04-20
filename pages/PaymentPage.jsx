import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { ShoppingCartIcon as PaypalIcon, Lock, ArrowUpRight, ArrowDownRight, Wallet, CreditCard } from "lucide-react-native";
import LoadingIndicator from "../payment/loading-indicator";
import SuccessConfirmation from "../payment/success-confirmation";
import PayPalButton from "../payment/paypal-button";
import { useAuth } from "../firebase/auth";
import { useBalance } from "../zustand/balance";
import { useNavigation } from "@react-navigation/native";

const PaymentPage = () => {
  const [paymentMethod] = useState("paypal");
  const [operationType, setOperationType] = useState("deposit");
  const [amount, setAmount] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { user, role } = useAuth();
  const { balance, addFunds, useBalance: withdrawFunds, fetchBalance } = useBalance();
  const navigation = useNavigation();

  useEffect(() => {
    if (user && user.uid) {
      fetchBalance(user.uid);
    }
    
    if (role === "designer") {
      setOperationType("withdraw");
    }
  }, [user, fetchBalance, role]);

  const handleAmountChange = (value) => {
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    setAmount(cleanedValue);
  };

  const handlePayPalSuccess = async (order) => {
    try {
      const numAmount = parseFloat(amount);
      if (operationType === "deposit") {
        await addFunds(user.uid, numAmount);
      } else {
        await withdrawFunds(user.uid, numAmount);
      }
      
      setIsProcessing(false);
      setIsSuccess(true);
    } catch (err) {
      console.error("Error updating balance:", err);
      setError("Failed to update balance");
      setIsProcessing(false);
    }
  };

  const handlePayPalError = (errorMessage) => {
    setIsProcessing(false);
    setError(errorMessage);
  };

  const handlePayPalCancel = () => {
    setIsProcessing(false);
    setError("Payment was cancelled");
  };

  const handleSubmit = async () => {
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (operationType === "withdraw" && numAmount > balance) {
      setError("Insufficient balance for withdrawal");
      return;
    }
    setIsProcessing(true);
  };

  if (isSuccess) {
    return <SuccessConfirmation operationType={operationType} amount={amount} />;
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Account Balance Management</Text>

      <View style={styles.mainContainer}>
        {/* Payment Form */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Manage Your Funds</Text>
            <View style={styles.secureContainer}>
              <Lock size={16} color="#16a34a" />
              <Text style={styles.secureText}>Secure Transaction</Text>
            </View>
          </View>

        <View style={styles.operationContainer}>
          {role === "client" && (
            <TouchableOpacity
              style={[
                styles.operationButton,
                operationType === "deposit" && styles.activeButton,
              ]}
              onPress={() => setOperationType("deposit")}
            >
              <ArrowUpRight size={16} color={operationType === "deposit" ? "#A67B5B" : "#6b7280"} />
              <Text style={[styles.buttonText, operationType === "deposit" && styles.activeText]}>
                Deposit
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.operationButton,
              operationType === "withdraw" && styles.activeButton,
            ]}
            onPress={() => setOperationType("withdraw")}
          >
            <ArrowDownRight size={16} color={operationType === "withdraw" ? "#A67B5B" : "#6b7280"} />
            <Text style={[styles.buttonText, operationType === "withdraw" && styles.activeText]}>
              Withdraw
            </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Amount ({operationType === "deposit" ? "to deposit" : "to withdraw"})
            </Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
          </View>

          <View style={styles.paymentMethodContainer}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethodBox}>
              <PaypalIcon size={24} color="#000" />
              <Text style={styles.paymentMethodText}>PayPal</Text>
            </View>
          </View>

          <View style={styles.paypalContainer}>
            <Text style={styles.paypalTitle}>
              {operationType === "deposit" ? "Add Funds to Your Balance" : "Withdraw Funds from Your Balance"}
            </Text>
            <Text style={styles.paypalSubtitle}>
              {operationType === "deposit"
                ? "Funds will be added to your account balance."
                : "Funds will be withdrawn from your account balance to your PayPal account."}
            </Text>
            <View style={styles.amountContainer}>
              <Text style={styles.amountValue}>${parseFloat(amount).toFixed(2)}</Text>
              <Text style={styles.amountCurrency}> USD</Text>
            </View>
            <View style={styles.paypalButtonsContainer}>
              <TouchableOpacity style={styles.paypalButtonYellow}>
                <Text style={styles.paypalButtonTextBlue}>Pay</Text>
                <Text style={styles.paypalButtonTextBrown}>Pal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paypalButtonBlack}>
                <CreditCard size={16} color="#FFFFFF" style={styles.creditIcon} />
                <Text style={styles.paypalButtonText}>Pay with Debit or Credit Card</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.secureFooter}>
              <Lock size={16} color="#6B7280" />
              <Text style={styles.secureFooterText}>Secure transaction powered by </Text>
              <Text style={styles.paypalTextBlue}>Pay</Text>
              <Text style={styles.paypalTextBrown}>Pal</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isProcessing && (
            <View style={styles.loadingContainer}>
              <LoadingIndicator />
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Summary Section */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Balance Summary</Text>
          <View style={styles.balanceCard}>
            <Wallet size={24} color="#A67B5B" />
            <Text style={styles.balanceText}>Current Balance</Text>
            <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
            <Text style={styles.balanceSubtitle}>Available for withdrawals</Text>
          </View>
          <Text style={styles.operationsTitle}>Account Operations</Text>
          <View style={styles.operationsCard}>
            <View style={styles.operationContent}>
              <View style={styles.operationHeader}>
                <Text style={styles.operationText}>Withdraw</Text>
                <ArrowDownRight size={20} color="#A67B5B" />
              </View>
              <Text style={styles.operationSubtitle}>Transfer funds from your balance to PayPal</Text>
            </View>
          </View>
          <View style={styles.secureTransactionsCard}>
            <Text style={styles.secureTransactionsTitle}>Secure Transactions</Text>
            <Text style={styles.secureTransactionsText}>
              All financial operations are processed securely through{" "}
              <Text style={styles.paypalTextBlue}>Pay</Text>
              <Text style={styles.paypalTextBrown}>Pal</Text>'s payment system.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  formContainer: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  secureContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secureText: {
    fontSize: 12,
    color: "#16a34a",
    marginLeft: 4,
  },
  operationContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 16,
  },
  operationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  activeButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#A67B5B",
  },
  buttonText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  activeText: {
    color: "#A67B5B",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#6B7280",
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  paymentMethodContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  paymentMethodBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#A67B5B",
    backgroundColor: "#F5EFE7",
    padding: 16,
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    marginTop: 8,
  },
  paypalContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  paypalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#000000",
  },
  paypalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003087", // Blue for $50.00
  },
  amountCurrency: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000", // Black for USD
  },
  paypalButtonsContainer: {
    width: "100%",
    marginBottom: 16,
  },
  paypalButtonYellow: {
    backgroundColor: "#FFC107",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8,
    flexDirection: "row", // To align Pay and Pal texts
    justifyContent: "center",
  },
  paypalButtonBlack: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    flexDirection: "row", // To align icon and text
    justifyContent: "center",
  },
  paypalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8, // Space between icon and text
  },
  paypalButtonTextBlue: {
    color: "#003087", // Blue for "Pay"
    fontSize: 16,
    fontWeight: "500",
  },
  paypalButtonTextBrown: {
    color: "#0677DAFF", // Brown for "Pal"
    fontSize: 16,
    fontWeight: "500",
  },
  creditIcon: {
    marginRight: 8, // Space between icon and text
  },
  secureFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  secureFooterText: {
    fontSize: 12,
    color: "#6B7280",
  },
  paypalTextBlue: {
    fontSize: 12,
    color: "#003087",
  },
  paypalTextBrown: {
    fontSize: 12,
    color: "#A67B5B", // Brown for "Pal"
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  summaryContainer: {
    width: '100%',
    minWidth: 280,
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 16,
    color: "#6B8073FF",
    marginTop: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginVertical: 8,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  operationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  operationsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  operationContent: {
    flexDirection: "column",
  },
  operationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  operationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginRight: 8,
  },
  operationSubtitle: {
    fontSize: 14,
    color: "#6E806BFF",
  },
  secureTransactionsCard: {
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    padding: 16,
  },
  secureTransactionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  secureTransactionsText: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default PaymentPage;