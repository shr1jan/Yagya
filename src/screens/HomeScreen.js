import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Pressable,
} from 'react-native';
import Footer from '../components/Footer';

export default function HomeScreen({ navigation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current; // Initial position off-screen

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    Animated.timing(slideAnim, {
      toValue: newState ? 0 : -300, // Slide in/out
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleOutsideTap = () => {
    if (isMenuOpen) {
      handleMenuToggle(); // Close the menu
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconLeft} onPress={handleMenuToggle}>
          <Image source={require('../../assets/icons/menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Welcome to <Text style={styles.highlight}>Yagya.ai</Text>
        </Text>
      </View>

      {/* OVERLAY (For Outside Tap) */}
      {isMenuOpen && (
        <Pressable style={styles.overlay} onPress={handleOutsideTap} />
      )}

      {/* SLIDING MENU */}
      <Animated.View
        style={[
          styles.menu,
          {
            transform: [{ translateX: slideAnim }], // Animate the X position
          },
        ]}
      >
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Help')}>
          <Text style={styles.menuText}>Help</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* MAIN CONTENT */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Tips on what to share about yourself</Text>
        <View style={styles.bulletPoints}>
          <Text style={styles.tipText}>• Be specific about your goals and aspirations</Text>
          <Text style={styles.tipText}>• Mention any relevant skills or experiences</Text>
          <Text style={styles.tipText}>• Describe the impact you hope to make</Text>
          <Text style={styles.tipText}>• Include any challenges you're facing</Text>
          <Text style={styles.tipText}>• Share your vision for the future</Text>
        </View>
      </ScrollView>

      {/* BUTTON CONTAINER */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Circle Button Pressed')}>
          <Text style={styles.circleButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.startButtonText}>Start the Yagya!</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER COMPONENT */}
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDE9F6' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#EDE9F6' },
  headerIconLeft: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { width: 24, height: 24 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  highlight: { color: '#9A66FF' },
  contentContainer: { padding: 20 },

  // OVERLAY (For Outside Tap)
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black
    zIndex: 999, // Below the menu but above other content
  },

  // SLIDING MENU
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300, // Width of the menu
    height: '100%',
    backgroundColor: '#FFF',
    padding: 20,
    zIndex: 1000, // Ensure it's above the overlay
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },

  // BUTTON CONTAINER
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#EDE9F6',
    position: 'absolute',
    bottom: 60, // Puts it right above the footer
    left: 0,
    right: 5,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9A66FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 0,
  },
  circleButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#9A66FF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 0,
    width: '80%',
  },
  startButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});