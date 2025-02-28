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
  TextInput,
  PanResponder,
  Vibration,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(-350)).current;
  const slideSettingsAnim = useRef(new Animated.Value(300)).current;


  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isMenuOpen && gestureState.dx > 0) {
          slideAnim.setValue(Math.max(-350, -350 + gestureState.dx));
        } else if (isMenuOpen && gestureState.dx < 0) {
          slideAnim.setValue(Math.max(-350, gestureState.dx));
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (!isMenuOpen && gestureState.dx > 100) {
          Vibration.vibrate(10); 
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setIsMenuOpen(true));
        } else if (isMenuOpen && gestureState.dx < -100) {
          Vibration.vibrate(10);
          setIsMenuOpen(false);
          Animated.timing(slideAnim, {
            toValue: -350,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          
          Animated.timing(slideAnim, {
            toValue: isMenuOpen ? 0 : -350,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  
  const settingsPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isSettingsOpen && gestureState.dy > 0) {
          slideSettingsAnim.setValue(Math.min(300, gestureState.dy));
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (isSettingsOpen && gestureState.dy > 100) {
          Vibration.vibrate(10); // Add vibration
          setIsSettingsOpen(false);
          Animated.timing(slideSettingsAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
        
          Animated.timing(slideSettingsAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  
  const chatHistory = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Jane Smith', lastMessage: 'See you tomorrow!' },
    { id: 3, name: 'Alice Johnson', lastMessage: 'Did you finish the report?' },
  ];

  
  const filteredChatHistory = chatHistory.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    Animated.timing(slideAnim, {
      toValue: newState ? 0 : -350,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSettingsToggle = () => {
    const newState = !isSettingsOpen;
    setIsSettingsOpen(newState);
    
    
    if (newState && isMenuOpen) {
      handleMenuToggle();
    }

    Animated.timing(slideSettingsAnim, {
      toValue: newState ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  
  onPanResponderRelease: (_, gestureState) => {
    if (!isMenuOpen && gestureState.dx > 100) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(true));
    } else if (isMenuOpen && gestureState.dx < -100) {
      setIsMenuOpen(false);
      Animated.timing(slideAnim, {
        toValue: -350,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      
      Animated.timing(slideAnim, {
        toValue: isMenuOpen ? 0 : -350,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  
  onPanResponderRelease: (_, gestureState) => {
    if (isSettingsOpen && gestureState.dy > 100) {
      setIsSettingsOpen(false);
      Animated.timing(slideSettingsAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      
      Animated.timing(slideSettingsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleOutsideTap = () => {
    if (isMenuOpen) {
      handleMenuToggle();
    }
    if (isSettingsOpen) {
      handleSettingsToggle();
    }
  };

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconLeft}
          onPress={handleMenuToggle}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <Image source={require('../../assets/icons/menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Welcome to <Text style={styles.highlight}>Yagya.ai</Text>
        </Text>
        <TouchableOpacity
          style={styles.headerIconRight}
          onPress={() => navigation.navigate('Nexus')}
          accessibilityLabel="Go to Nexus"
          accessibilityRole="button"
        >
          <Image source={require('../../assets/icons/nexus.png')} style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      {/* OVERLAY (For Outside Tap) */}
      {isMenuOpen && <Pressable style={styles.overlay} onPress={handleOutsideTap} />}

      {/* SLIDING MENU */}
      <Animated.View
        style={[
          styles.menu,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* SEARCH BAR */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* CHAT HISTORY LIST */}
        <ScrollView
          style={styles.chatHistoryContainer}
          contentContainerStyle={styles.chatHistoryContent}
        >
          {filteredChatHistory.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[styles.menuItem, styles.chatHistoryItem]}
              onPress={() => navigation.navigate('Chat', { chatId: chat.id })}
            >
              <Text style={styles.menuText}>{chat.name}</Text>
              <Text style={styles.menuSubtext}>{chat.lastMessage}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SETTINGS BUTTON */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsToggle}
          accessibilityLabel="Open Settings"
          accessibilityRole="button"
        >
          <Image
            source={require('../../assets/icons/settings.png')}
            style={styles.settingsIcon}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* MAIN CONTENT */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Empty ScrollView to maintain layout spacing */}
      </ScrollView>

      {/* BUTTON CONTAINER */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => console.log('Circle Button Pressed')}
          accessibilityLabel="Create new chat"
          accessibilityRole="button"
        >
          <Text style={styles.circleButtonText}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.startButton}
          placeholder="Message"
          placeholderTextColor="#33333380"
          onSubmitEditing={() => navigation.navigate('Chat')}
        />
      </View>
    {/* SETTINGS MENU */}
      {isSettingsOpen && <Pressable style={styles.overlay} onPress={handleOutsideTap} />}
      <Animated.View
        style={[
          styles.settingsMenu,
          {
            transform: [{ translateY: slideSettingsAnim }],
          },
        ]}
        {...settingsPanResponder.panHandlers}
      >
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <TouchableOpacity onPress={handleSettingsToggle}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.settingsContent}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => {
              handleSettingsToggle();
              navigation.navigate('Settings');
            }}
          >
            <Text style={styles.settingsItemText}>Account Settings</Text>
          </TouchableOpacity>
          {/* Add more settings items as needed */}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDE9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#EDE9F6',
  },
  headerIconLeft: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerIconRight: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { width: 24, height: 24 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  highlight: { color: '#9A66FF' },
  contentContainer: { padding: 20, flex: 1 },

  // OVERLAY (For Outside Tap)
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 350,
    height: '100%',
    backgroundColor: '#FFF',
    paddingTop: 20,
    paddingBottom: 100,
    paddingLeft: 30,
    paddingRight: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  // SEARCH BAR
  searchBar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },

  // CHAT HISTORY
  chatHistoryContainer: {
    flex: 1,
    marginBottom: 20,
  },
  chatHistoryContent: {
    paddingBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  // BUTTON CONTAINER
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#EDE9F6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 5,
    marginBottom: 0,
    zIndex: 50,
  },

  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 75,
  },

  
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 350,
    height: '100%',
    backgroundColor: '#FFF',
    paddingTop: 20,
    paddingBottom: 100,
    paddingLeft: 30,
    paddingRight: 20,
    zIndex: 100, 
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 0,
    width: '80%',
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // SETTINGS BUTTON
  settingsButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  settingsIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  // SETTINGS MENU
  settingsMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 5,
  },
  settingsContent: {
    flex: 1,
  },
  settingsItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  settingsItemText: {
    fontSize: 16,
    color: '#333',
  },
});