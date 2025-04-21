import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useAuth } from "../firebase/auth";
import { useBalance } from "../zustand/balance";
import { useNavigation } from "@react-navigation/native";
import OrderSummary from "../payment/order-summary";
import SuccessConfirmation from "../payment/success-confirmation";
import PayPalButton from "../payment/paypal-button";

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [operationType, setOperationType] = useState("deposit");
  const [amount, setAmount] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { user, role } = useAuth();
  const { balance, addFunds, withdrawFunds, fetchBalance } = useBalance();
  const navigation = useNavigation();

  useEffect(() => {
    const initializeComponent = async () => {
      if (user && user.uid) {
        await fetchBalance(user.uid);
      }
      if (role === "designer") {
        setOperationType("withdraw");
      }
      
      // Reset state when component mounts
      setIsSuccess(false);
      setIsProcessing(false);
      setError(null);
      setAmount("0");
    };
    
    initializeComponent();
  }, [user, fetchBalance, role]);

  const handleAmountChange = (value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setAmount(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setAmount(cleaned);
    }
    // Clear any previous errors when user changes the amount
    if (error) setError(null);
  };

  const handlePayPalSuccess = async (orderData) => {
    try {
      setIsProcessing(true);
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount <= 0) {
        setError("Please enter a valid amount");
        setIsProcessing(false);
        return;
      }
      
      // For withdraw operations, check if there's sufficient balance
      if (operationType === "withdraw" && numAmount > balance) {
        setError("Insufficient balance for withdrawal");
        setIsProcessing(false);
        return;
      }
      
      let success = false;
      if (operationType === "deposit") {
        success = await addFunds(user.uid, numAmount);
      } else {
        success = await withdrawFunds(user.uid, numAmount);
      }
      
      if (success) {
        // Refresh balance after successful operation
        await fetchBalance(user.uid);
        setIsProcessing(false);
        setIsSuccess(true);
        setError(null);
      } else {
        setError(operationType === "deposit" ? "Failed to add funds" : "Failed to withdraw funds");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update balance");
      setIsProcessing(false);
    }
  };

  const handlePayPalError = (message) => {
    setIsProcessing(false);
    setError(message);
  };

  const handlePayPalCancel = () => {
    setIsProcessing(false);
    setError("Payment was cancelled");
  };

  if (isSuccess) {
    return <SuccessConfirmation operationType={operationType} amount={amount} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Account Balance Management</Text>

      <View style={styles.toggleContainer}>
        {role === "client" && (
          <TouchableOpacity
            style={[
              styles.toggleButton,
              operationType === "deposit" && styles.toggleActive,
            ]}
            onPress={() => setOperationType("deposit")}
          >
            <Text style={styles.toggleText}>Deposit</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            operationType === "withdraw" && styles.toggleActive,
          ]}
          onPress={() => setOperationType("withdraw")}
        >
          <Text style={styles.toggleText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount ({operationType === "deposit" ? "to deposit" : "to withdraw"})</Text>
        <View style={styles.balanceInfo}>
          <Text style={styles.currentBalance}>Current Balance: ${balance.toFixed(2)}</Text>
        </View>
        <TextInput
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          placeholder="0.00"
          style={styles.input}
        />
      </View>

      <View style={styles.paypalContainer}>
        <Text style={styles.paypalTitle}>
          {operationType === "deposit" ? "Add Funds to Your Balance" : "Withdraw Funds to PayPal"}
        </Text>
        <Text style={styles.paypalDesc}>
          {operationType === "deposit"
            ? "Funds will be added to your account balance."
            : "Funds will be withdrawn to your PayPal account."}
        </Text>

        {operationType === "withdraw" && parseFloat(amount) > balance ? (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>Insufficient balance for withdrawal</Text>
            <Text style={styles.errorDesc}>Your current balance is ${balance.toFixed(2)}</Text>
          </View>
        ) : (
          <>
            {operationType === "deposit" && (
              <View style={styles.paymentMethodsContainer}>
                <Text style={styles.paymentMethodsTitle}>Choose Payment Method</Text>
                
                <View style={styles.paymentButtonsContainer}>
                  {/* PayPal Payment Button */}
                  {paymentMethod === "paypal" ? (
                    <PayPalButton
                      amount={amount}
                      operationType={operationType}
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                      onCancel={handlePayPalCancel}
                      testMode={true} // Set to false in production
                    />
                  ) : (
                    <TouchableOpacity 
                      style={styles.paymentButton}
                      onPress={() => setPaymentMethod("paypal")}
                    >
                      <View style={styles.paymentButtonContent}>
                        <View style={styles.paypalLogoContainer}>
                          <Text style={styles.paypalLogo}>Pay<Text style={{color: '#169BD7'}}>Pal</Text></Text>
                        </View>
                        <Text style={styles.paymentButtonText}>Pay with PayPal</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  
                  {/* Credit Card/Bank Payment Button */}
                  <TouchableOpacity 
                    style={styles.paymentButton}
                    onPress={() => setPaymentMethod("card")}
                  >
                    <View style={styles.paymentButtonContent}>
                      <View style={styles.cardIconContainer}>
                        <View style={styles.cardIcon}>
                          <View style={styles.cardChip} />
                          <View style={styles.cardNumberDots}>
                            <View style={styles.cardDot} />
                            <View style={styles.cardDot} />
                            <View style={styles.cardDot} />
                            <View style={styles.cardDot} />
                          </View>
                        </View>
                      </View>
                      <Text style={styles.paymentButtonText}>Pay with Card/Bank</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Only show card form if card payment is selected */}
            {paymentMethod === "card" && operationType === "deposit" && (
              <View style={styles.cardPaymentContainer}>
                <View style={styles.cardInputGroup}>
                  <Text style={styles.cardLabel}>Card Number</Text>
                  <TextInput
                    placeholder="1234 5678 9012 3456"
                    style={styles.cardInput}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>
                
                <View style={styles.cardRow}>
                  <View style={[styles.cardInputGroup, {flex: 1, marginRight: 8}]}>
                    <Text style={styles.cardLabel}>Expiry Date</Text>
                    <TextInput
                      placeholder="MM/YY"
                      style={styles.cardInput}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.cardInputGroup, {flex: 1, marginLeft: 8}]}>
                    <Text style={styles.cardLabel}>CVV</Text>
                    <TextInput
                      placeholder="123"
                      style={styles.cardInput}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry={true}
                    />
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.cardPayButton}
                  onPress={() => {
                    if (parseFloat(amount) > 0) {
                      // Simulate card payment process
                      setIsProcessing(true);
                      setTimeout(() => {
                        handlePayPalSuccess({
                          id: `card-${Date.now()}`,
                          status: 'COMPLETED'
                        });
                      }, 1500);
                    } else {
                      setError("Please enter a valid amount");
                    }
                  }}
                >
                  <Text style={styles.cardPayButtonText}>Pay ${parseFloat(amount).toFixed(2)}</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Show PayPal button only for withdrawals */}
            {operationType === "withdraw" && (
              <PayPalButton
                amount={amount}
                operationType={operationType}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
                onCancel={handlePayPalCancel}
                testMode={true}
              />
            )}
          </>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {isProcessing && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#A67B5B" />}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <OrderSummary />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorDesc: {
    color: "#B91C1C",
    fontSize: 14,
    marginTop: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  toggleButton: {
    padding: 10,
    marginHorizontal: 10,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  toggleActive: {
    borderColor: "#A67B5B",
  },
  toggleText: {
    color: "#333",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: "#555",
  },
  balanceInfo: {
    marginBottom: 8,
  },
  currentBalance: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  paypalContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 15,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  paymentButtonsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
  },
  paymentButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paypalLogoContainer: {
    marginRight: 12,
    width: 50,
    height: 30,
    justifyContent: "center",
  },
  paypalLogo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#003087",
  },
  cardIconContainer: {
    marginRight: 12,
    width: 50,
    height: 30,
    justifyContent: "center",
  },
  cardIcon: {
    width: 40,
    height: 25,
    backgroundColor: "#A67B5B",
    borderRadius: 4,
    padding: 5,
    justifyContent: "space-between",
  },
  cardChip: {
    width: 10,
    height: 6,
    backgroundColor: "#F5EFE7",
    borderRadius: 1,
  },
  cardNumberDots: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cardDot: {
    width: 3,
    height: 3,
    backgroundColor: "#F5EFE7",
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  cardPaymentContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  cardInputGroup: {
    marginBottom: 15,
  },
  cardLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  cardInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardPayButton: {
    backgroundColor: "#A67B5B",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 5,
  },
  cardPayButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  paypalTitle: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  paypalDesc: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#FFF",
    borderColor: "#DDD",
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
  },
  backButtonText: {
    color: "#555",
    fontWeight: "500",
  },
});

export default PaymentPage;
