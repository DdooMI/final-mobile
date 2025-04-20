import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
                                                                                                                                                                                                                                                                                                    import { PayPal } from 'react-native-paypal';

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

  // Initialize PayPal
  useEffect(() => {
    PayPal.initialize({
      clientId: process.env.PAYPAL_CLIENT_ID || 'test',
      environment: testMode ? PayPal.SANDBOX : PayPal.PRODUCTION,       
      currency: 'USD',
      intent: 'capture'
    });
  }, [testMode]);
       
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const numAmount = testMode && (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
        ? 1.00 // Use default amount for testing
        : parseFloat(amount || 0);

      const description = operationType === 'withdraw'
        ? 'Withdrawal from account balance'
        : operationType === 'balance'
          ? 'Payment using PayPal balance'
          : 'Deposit to account balance';

      const payment = await PayPal.pay({
        amount: numAmount.toFixed(2),
        currency: 'USD',
        description,
        userAction: 'PAY_NOW',
        metadata: {
          operationType,
          brandName: 'Interior Design Platform'
        }
      });

      if (payment.status === 'completed' || testMode) {
        const successData = testMode ? {
          id: `test-${Date.now()}`,
          status: 'COMPLETED',
          amount: {
            value: numAmount.toFixed(2),
            currency_code: 'USD'
          },
          create_time: new Date().toISOString()
        } : payment;

        onSuccess(successData);
      } else {
        onError('Payment not completed');
      }
    } catch (error) {
      console.error('PayPal error:', error);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.paypalContainer}>
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
      
      <View style={styles.paypalButtonWrapper}>
        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : (
          <TouchableOpacity
            style={[styles.paypalButton, isLoading && styles.paypalButtonDisabled]}
            onPress={handlePayment}
            disabled={!testMode && (!!errorMessage || isLoading || parseFloat(amount) <= 0)}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.paypalButtonText}>
                Pay with PayPal
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.securityBadge}>
        <Text style={styles.securityText}>Secure transaction powered by PayPal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  paypalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '100%',
  },
  paypalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paypalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c2e2f',
    marginBottom: 10,
  },
  paypalAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 24,
    color: '#0070ba',
    marginRight: 5,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0070ba',
  },
  currencyName: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  paypalButtonWrapper: {
    marginVertical: 20,
  },
  paypalButton: {
    backgroundColor: '#0070ba',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  paypalButtonDisabled: {
    opacity: 0.7,
  },
  paypalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 10,
  },
  securityBadge: {
    alignItems: 'center',
    marginTop: 10,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
  },
});

export default PayPalButton;
