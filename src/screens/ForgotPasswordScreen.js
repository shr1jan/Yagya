// src/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onResetPassword = async () => {
    // Input validation
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      // Implement the password reset logic
      // This would typically be an API call to your backend
      // Example implementation:
      // await authService.sendPasswordResetEmail(email);
      // For demonstration purposes, simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Password reset link sent to your email');
      // Wait briefly to show success message before navigating back
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      setErrorMessage('Failed to send reset link. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      {successMessage ? (
        <Text style={styles.successText}>{successMessage}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.resetButton, isLoading && styles.disabledButton]}
        onPress={onResetPassword}
        disabled={isLoading}
      >
        <Text style={styles.resetButtonText}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE9F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#000',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#000',
  },
  resetButton: {
    backgroundColor: '#9A66FF',
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginTop: 10,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#C0B3E1',
  },
});