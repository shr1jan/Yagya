import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    // TODO: Implement your login logic (API, etc.)
    // For now, navigate to Home screen
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start the YAGYA!</Text>
      <Text style={styles.subtitle}>Login to Yagya.ai</Text>

      {/* Email Input with Icon */}
      <View style={styles.inputContainer}>
        <Image
          source={require('../../assets/icons/email.png')} // Correct path to email icon
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input with Icon */}
      <View style={styles.inputContainer}>
        <Image
          source={require('../../assets/icons/key.png')} // Correct path to key icon
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.newUser}>New User? Sign Up!</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#000',
    fontSize: 14,
  },
  forgotPassword: {
    color: 'blue',
    textAlign: 'right',
    width: '100%',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  loginButton: {
    backgroundColor: '#9A66FF',
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  newUser: {
    color: '#000',
    marginTop: 10,
    fontFamily: 'PlusJakartaSans-Medium',
  },
});