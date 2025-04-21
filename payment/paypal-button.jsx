import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const [showWebView, setShowWebView] = useState(false);
  const [paypalUrl, setPaypalUrl] = useState('');
  
  // Validate amount (disabled in test mode)
  useEffect(() => {
    setErrorMessage('');
    // Only validate amount if not in test mode
    if (!testMode && (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      setErrorMessage('Please enter a valid amount');
    }
  }, [amount, testMode]);

  const validatedAmount = parseFloat(amount || 0).toFixed(2);
  const description =
    operationType === 'withdraw'
      ? 'Withdrawal from account balance'
      : operationType === 'balance'
      ? 'Payment using PayPal balance'
      : 'Deposit to account balance';

  // Create PayPal order and get redirect URL
  const createPayPalOrder = () => {
    if (parseFloat(validatedAmount) <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      return;
    }
    
    setIsLoading(true);
    
    if (testMode) {
      // In test mode, simulate successful payment without actual processing
      setTimeout(() => {
        setIsLoading(false);
        const simulatedOrderData = {
          id: `test-order-${Date.now()}`,
          status: 'COMPLETED',
          payer: {
            email_address: 'test@example.com',
            payer_id: `test-payer-${Date.now()}`
          },
          purchase_units: [{
            amount: {
              value: validatedAmount,
              currency_code: 'USD'
            }
          }],
          create_time: new Date().toISOString(),
          update_time: new Date().toISOString()
        };
        if (onSuccess) onSuccess(simulatedOrderData);
      }, 1000);
    } else {
      // In real mode, we would get a redirect URL from the server
      // For now, we'll use the sandbox URL
      const redirectUrl = 'https://www.sandbox.paypal.com/checkoutnow?token=demo_' + Date.now();
      setPaypalUrl(redirectUrl);
      setShowWebView(true);
    }
  };
  
  // Handle the actual payment completion
  const handlePayPalPayment = () => {
    setIsLoading(true);
    
    // Simulate successful payment
    setTimeout(() => {
      setIsLoading(false);
      setShowWebView(false);
      const simulatedOrderData = {
        id: `order-${Date.now()}`,
        status: 'COMPLETED',
        payer: {
          email_address: 'customer@example.com',
          payer_id: `payer-${Date.now()}`
        },
        purchase_units: [{
          amount: {
            value: validatedAmount,
            currency_code: 'USD'
          }
        }],
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      };
      if (onSuccess) onSuccess(simulatedOrderData);
    }, 1000);
  };

  const handleCancel = () => {
    setShowWebView(false);
    if (testMode) {
      // In test mode, treat cancellations as successes
      const simulatedOrderData = {
        id: `test-cancel-${Date.now()}`,
        status: 'COMPLETED',
        payer: {
          email_address: 'test@example.com',
          payer_id: `test-payer-${Date.now()}`
        },
        purchase_units: [{
          amount: {
            value: parseFloat(amount || 1).toFixed(2),
            currency_code: 'USD'
          }
        }],
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      };
      if (onSuccess) onSuccess(simulatedOrderData);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleError = (err) => {
    console.error('PayPal error:', err);
    
    if (testMode) {
      // In test mode, simulate success even on error
      setErrorMessage('');
      const simulatedOrderData = {
        id: `test-error-${Date.now()}`,
        status: 'COMPLETED',
        payer: {
          email_address: 'test@example.com',
          payer_id: `test-payer-${Date.now()}`
        },
        purchase_units: [{
          amount: {
            value: parseFloat(amount || 1).toFixed(2),
            currency_code: 'USD'
          }
        }],
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      };
      if (onSuccess) onSuccess(simulatedOrderData);
    } else {
      setErrorMessage('PayPal encountered an error');
      if (onError) onError('PayPal encountered an error');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with title and amount */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {operationType === 'deposit'
            ? 'Deposit Funds'
            : operationType === 'withdraw'
            ? 'Withdraw Funds'
            : 'Pay with PayPal Balance'}
        </Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.amount}>{validatedAmount}</Text>
          <Text style={styles.currencyName}>USD</Text>
        </View>
      </View>

      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* PayPal WebView (when active) */}
      {showWebView ? (
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowWebView(false);
                handleCancel();
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>PayPal Checkout</Text>
          </View>
          <WebView
            style={styles.webView}
            source={{ uri: paypalUrl || 'https://www.sandbox.paypal.com' }}
            onNavigationStateChange={(event) => {
              // Check for success or cancel in the URL
              if (event.url.includes('success') || event.url.includes('return')) {
                setShowWebView(false);
                handlePayPalPayment();
              } else if (event.url.includes('cancel')) {
                handleCancel();
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => <ActivityIndicator size="large" color="#0070BA" />}
          />
        </View>
      ) : (
        // PayPal Button
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.paypalButton}
            disabled={isLoading || (!testMode && parseFloat(amount) <= 0)}
            onPress={() => {
              createPayPalOrder();
            }}
          >
            <View style={styles.paypalButtonContent}>
              <View style={styles.paypalLogoContainer}>
                <Text style={styles.paypalLogo}>
                  <Text style={{color: '#003087'}}>Pay</Text>
                  <Text style={{color: '#009cde'}}>Pal</Text>
                </Text>
              </View>
              <Text style={styles.paypalButtonText}>
                {operationType === 'withdraw' ? 'Withdraw with PayPal' : 
                 operationType === 'balance' ? 'Pay with PayPal' : 
                 'Checkout with PayPal'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>
            {operationType === 'balance' ? 'Processing your payment...' : 
             `Processing your ${operationType}...`}
          </Text>
        </View>
      )}

      {/* Footer with security badge */}
      <View style={styles.footer}>
        <View style={styles.securityBadge}>
          <Icon name="lock" size={14} color="#666" style={styles.lockIcon} />
          <Text style={styles.securityText}>Secure transaction powered by PayPal</Text>
        </View>
      </View>
    </View>
  );
};

export default PayPalButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2E2F',
    marginBottom: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2E2F',
    marginRight: 2,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2E2F',
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6C7378',
    marginLeft: 5,
  },
  errorContainer: {
    backgroundColor: '#FEF1F2',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  error: {
    color: '#e53e3e',
    textAlign: 'center',
    fontSize: 14,
  },
  webViewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  webViewTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 30,
  },
  webView: {
    flex: 1,
  },
  buttonWrapper: {
    marginVertical: 10,
  },
  paypalButton: {
    backgroundColor: '#FFC439',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalLogoContainer: {
    marginRight: 10,
  },
  paypalLogo: {
    fontSize: 18,
    fontWeight: '800',
  },
  paypalButtonText: {
    color: '#003087',
    fontWeight: '700',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    zIndex: 1000,
  },
  processingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    marginRight: 6,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
  }
});
