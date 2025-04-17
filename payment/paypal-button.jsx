import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const PayPalButton = ({
  amount,
  operationType = 'deposit', // 'deposit', 'withdraw', or 'balance'
  onSuccess,
  onError,
  onCancel,
  testMode = true // Enable test mode by default for testing purposes
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate amount (disabled in test mode)
  useEffect(() => {
    setErrorMessage('');
    // Only validate amount if not in test mode
    if (!testMode && (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      setErrorMessage('Please enter a valid amount');
    }
  }, [amount, testMode]);

  // PayPal script options
  const paypalOptions = {
    'client-id': 'test', // Replace with your actual PayPal client ID
    currency: 'USD',
    intent: 'capture',
  };

  return (
    <View style={styles.paypalContainer}>
      {/* Header with amount */}
      <View style={styles.paypalHeader}>
        <Text style={styles.paypalTitle}>
          {operationType === 'deposit' ? 'Deposit Funds' : 
           operationType === 'withdraw' ? 'Withdraw Funds' : 
           'Pay with PayPal Balance'}
        </Text>
        <View style={styles.paypalAmount}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.amount}>{parseFloat(amount || 0).toFixed(2)}</Text>
          <Text style={styles.currencyName}>USD</Text>
        </View>
      </View>
      
      {/* PayPal Button */}
      <View style={styles.paypalButtonWrapper}>
        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : (
          <WebView
            source={{
              uri: `https://www.paypal.com/sdk/js?client-id=${paypalOptions['client-id']}&currency=${paypalOptions.currency}`,
            }}
            style={styles.paypalButtonElement}
          />
        )}
      </View>
      
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingMessage}>
            {operationType === 'balance' ? 'Processing your payment...' : 
             `Processing your ${operationType}...`}
          </View>
        </View>
      )}
      
      {/* Footer with security badge */}
      <View style={styles.paypalFooter}>
        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>Secure transaction powered by PayPal</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  paypalContainer: {
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    padding: 20,
    fontFamily: 'Arial',
    position: 'relative',
  },
  paypalHeader: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  paypalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2e2f',
    marginBottom: 10,
  },
  paypalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0070ba',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currency: {
    fontSize: 24,
    marginRight: 5,
  },
  amount: {
    fontSize: 32,
  },
  currencyName: {
    fontSize: 16,
    marginLeft: 5,
    color: '#666',
    fontWeight: 'normal',
  },
  paypalButtonWrapper: {
    position: 'relative',
    marginVertical: 20,
    minHeight: 55,
    zIndex: 1,
  },
  paypalButtonElement: {
    width: '100%',
    minHeight: 55,
    position: 'relative',
    zIndex: 2,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 4,
  },
  processingMessage: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    fontWeight: '600',
    color: '#2c2e2f',
  },
  paypalFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: '#666',
  },
  securityText: {
    fontSize: 12,
    color: '#666',
  },
  errorMessage: {
    color: '#e53e3e',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default PayPalButton;
