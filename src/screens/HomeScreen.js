import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Pressable,
  TextInput,
  PanResponder,
  Vibration,
  ToastAndroid,
  AccessibilityInfo,
  FlatList,
  Platform,
  ScrollView,
  Easing,
} from 'react-native';

// Split into smaller components for better maintainability
const ChatHistoryItem = ({ chat, onPress }) => (
  <TouchableOpacity
    style={styles.chatHistoryItem}
    onPress={onPress}
    accessibilityLabel={`Chat with ${chat.name}`}
    accessibilityHint={`Last message: ${chat.lastMessage}`}
    accessibilityRole="button"
  >
    <Text style={styles.menuText}>{chat.name}</Text>
    <Text style={styles.menuSubtext}>{chat.lastMessage}</Text>
  </TouchableOpacity>
);

const MenuDrawer = ({ isOpen, slideAnim, onClose, onSettingsPress, searchQuery, setSearchQuery, chatHistory, onChatSelect }) => {
  const filteredChatHistory = chatHistory.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Animated.View
      style={[
        styles.menu,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
      accessibilityViewIsModal={isOpen}
      accessibilityLiveRegion="polite"
      importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
    >
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search chats"
        accessibilityHint="Search through your chat history"
      />

      <FlatList
        data={filteredChatHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ChatHistoryItem
            chat={item}
            onPress={() => onChatSelect(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.noResultsText}>No chats found</Text>
        }
        style={styles.chatHistoryContainer}
        contentContainerStyle={styles.chatHistoryContent}
        accessibilityLabel="Chat history"
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      />

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        accessibilityLabel="Open Settings"
        accessibilityRole="button"
        accessibilityHint="Open the settings menu"
      >
        <Image
          source={require('../../assets/icons/settings.png')}
          style={styles.settingsIcon}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const SettingsPanel = ({ isOpen, slideSettingsAnim, onClose, onNavigateToSettings }) => {
  const panResponderRef = useRef(null);
  useEffect(() => {
    // Initialize settings pan responder with correct measurements
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Don't capture initial taps
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to significant downward gestures
        return isOpen &&
          gestureState.dy > 10 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isOpen && gestureState.dy > 0) {
          // Ensure we don't set invalid values that could cause the NullPointerException
          const newValue = Math.min(300, gestureState.dy);
          if (newValue >= 0 && newValue <= 300) {
            slideSettingsAnim.setValue(newValue);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Close settings if dragged down significantly
          Animated.timing(slideSettingsAnim, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }).start(() => {
            onClose();
          });
        } else {
          // Snap back to open position
          Animated.spring(slideSettingsAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            mass: 0.8,
            stiffness: 100,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset to open position if gesture is interrupted
        Animated.spring(slideSettingsAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }).start();
      },
    });
  }, [isOpen, slideSettingsAnim, onClose]);
  return (
    <Animated.View
      style={[
        styles.settingsMenu,
        {
          transform: [{ translateY: slideSettingsAnim }],
        },
      ]}
      accessibilityViewIsModal={isOpen}
      accessibilityLiveRegion="polite"
      importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
    >
      <View
        style={styles.settingsPanArea}
        {...(panResponderRef.current?.panHandlers || {})}
      />
      {/* Profile Picture */}
      {isOpen && (
      <View style={styles.profilePictureContainer}>
        <View style={styles.profilePicture}>
          <Text style={styles.profileInitials}>YA</Text>
        </View>
      </View>
      )}
      {/* Settings Header */}
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={onClose}
          accessibilityLabel="Close settings"
          accessibilityRole="button"
        >
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
      </View>
      {/* Settings Content */}
      <ScrollView
        style={styles.settingsContent}
        contentContainerStyle={styles.settingsContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings */}
        <View style={styles.settingsCategory}>
          <Text style={styles.categoryTitle}>Account</Text>
          <TouchableOpacity
            style={[styles.settingsItem, styles.settingsItemRow]}
            onPress={() => onNavigateToSettings('Profile')}
            accessibilityLabel="Profile settings"
            accessibilityRole="button"
            accessibilityHint="Navigate to profile settings"
          >
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsIcon}>
                <Text style={styles.iconPlaceholder}>👤</Text>
              </View>
              <Text style={styles.settingsItemText}>Profile</Text>
            </View>
            <View style={styles.itemRightContent}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsItem, styles.settingsItemRow]}
            onPress={() => onNavigateToSettings('Notifications')}
            accessibilityLabel="Notification settings"
            accessibilityRole="button"
            accessibilityHint="Navigate to notification settings"
          >
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsIcon}>
                <Text style={styles.iconPlaceholder}>🔔</Text>
              </View>
              <Text style={styles.settingsItemText}>Notifications</Text>
            </View>
            <View style={styles.itemRightContent}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Preferences */}
        <View style={styles.settingsCategory}>
          <Text style={styles.categoryTitle}>Preferences</Text>
          <TouchableOpacity
            style={[styles.settingsItem, styles.settingsItemRow]}
            onPress={() => onNavigateToSettings('AppAppearance')}
            accessibilityLabel="App appearance settings"
            accessibilityRole="button"
            accessibilityHint="Navigate to app appearance settings"
          >
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsIcon}>
                <Text style={styles.iconPlaceholder}>🎨</Text>
              </View>
              <Text style={styles.settingsItemText}>App Appearance</Text>
            </View>
            <View style={styles.itemRightContent}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsItem, styles.settingsItemRow]}
            onPress={() => onNavigateToSettings('Privacy')}
            accessibilityLabel="Privacy settings"
            accessibilityRole="button"
            accessibilityHint="Navigate to privacy settings"
          >
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsIcon}>
                <Text style={styles.iconPlaceholder}>🔒</Text>
              </View>
              <Text style={styles.settingsItemText}>Privacy & Security</Text>
            </View>
            <View style={styles.itemRightContent}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Support */}
        <View style={styles.settingsCategory}>
          <Text style={styles.categoryTitle}>Support</Text>
          <TouchableOpacity
            style={[styles.settingsItem, styles.settingsItemRow]}
            onPress={() => onNavigateToSettings('Help')}
            accessibilityLabel="Help center"
            accessibilityRole="button"
            accessibilityHint="Navigate to help center"
          >
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsIcon}>
                <Text style={styles.iconPlaceholder}>❓</Text>
              </View>
              <Text style={styles.settingsItemText}>Help Center</Text>
            </View>
            <View style={styles.itemRightContent}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsItem, styles.settingsItemRow]}
            onPress={() => onNavigateToSettings('Feedback')}
            accessibilityLabel="Provide feedback"
            accessibilityRole="button"
            accessibilityHint="Navigate to feedback form"
          >
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsIcon}>
                <Text style={styles.iconPlaceholder}>📝</Text>
              </View>
              <Text style={styles.settingsItemText}>Provide Feedback</Text>
            </View>
            <View style={styles.itemRightContent}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Settings Footer */}
      <View style={styles.settingsFooter}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => onNavigateToSettings('Logout')}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Yagya.ai v1.0.5</Text>
      </View>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }) {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  // Refs for animations
  const slideAnim = useRef(new Animated.Value(-350)).current;
  const slideSettingsAnim = useRef(new Animated.Value(300)).current;
  const toastTimeoutRef = useRef(null);
  const isVibrationSupportedRef = useRef(true);

  // Chat data
  const chatHistory = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Jane Smith', lastMessage: 'See you tomorrow!' },
    { id: 3, name: 'Alice Johnson', lastMessage: 'Did you finish the report?' },
  ];

  // Check vibration support
  useEffect(() => {
    // On iOS, check if vibration is available (using feature detection)
    if (Platform.OS === 'ios') {
      isVibrationSupportedRef.current = typeof Vibration.vibrate === 'function';
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    // Capture the current ref value inside the effect
    const currentToastTimeoutRef = toastTimeoutRef.current;
    return () => {
      // Clean up any pending animations
      slideAnim.stopAnimation();
      slideSettingsAnim.stopAnimation();
      // Clear any pending timeouts using the captured value
      if (currentToastTimeoutRef) {
        clearTimeout(currentToastTimeoutRef);
      }
    };
  }, [slideAnim, slideSettingsAnim]);

  // Improved vibration handler with support check
  const handleVibrate = useCallback(() => {
    if (!isVibrationSupportedRef.current) {
      return;
    }
    try {
      // Use appropriate vibration duration based on platform
      if (Platform.OS === 'ios') {
        // iOS responds to different vibration patterns
        Vibration.vibrate([0, 50]);
      } else {
        // Android needs a longer vibration to be noticeable
        Vibration.vibrate(100);
        ToastAndroid.show('Navigation successful', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.warn('Vibration failed:', error);
      // Don't show error toasts for non-critical features like vibration
    }
  }, []);

  const handleMenuToggle = useCallback(() => {
    const newState = !isMenuOpen;
    // Start animation
    Animated.timing(slideAnim, {
      toValue: newState ? 0 : -350,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update state after animation completes
      setIsMenuOpen(newState);
      if (newState) {
        handleVibrate();
        // Move accessibility focus to the menu
        AccessibilityInfo.isScreenReaderEnabled().then(isEnabled => {
          if (isEnabled) {
            // Find first focusable element in menu
            // This is a placeholder - in a real app you'd use findNodeHandle and focus
          }
        });
      }
    });
    // Close settings if menu is opening
    if (newState && isSettingsOpen) {
      handleSettingsClose();
    }
  }, [isMenuOpen, isSettingsOpen, slideAnim, handleVibrate, handleSettingsClose]);

  const handleMenuClose = useCallback(() => {
    if (!isMenuOpen) {
      return;
    }
    Animated.timing(slideAnim, {
      toValue: -350,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsMenuOpen(false);
    });
  }, [isMenuOpen, slideAnim]);

  const handleSettingsToggle = useCallback(() => {
    const newState = !isSettingsOpen;
    Animated.timing(slideSettingsAnim, {
      toValue: newState ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSettingsOpen(newState);
      if (newState) {
        handleVibrate();
        // Move accessibility focus to settings panel
        AccessibilityInfo.isScreenReaderEnabled().then(isEnabled => {
          if (isEnabled) {
            // Similar accessibility focus management
          }
        });
      }
    });
    // Close menu if settings is opening
    if (newState && isMenuOpen) {
      handleMenuClose();
    }
  }, [isSettingsOpen, slideSettingsAnim, handleVibrate, isMenuOpen, handleMenuClose]);

  const handleSettingsClose = useCallback(() => {
    if (!isSettingsOpen) {
      return;
    }
    Animated.timing(slideSettingsAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSettingsOpen(false);
    });
  }, [isSettingsOpen, slideSettingsAnim]);

  const handleOverlayTap = useCallback(() => {
    if (isMenuOpen) {
      handleMenuClose();
    }
    if (isSettingsOpen) {
      handleSettingsClose();
    }
  }, [isMenuOpen, isSettingsOpen, handleMenuClose, handleSettingsClose]);

  // Improved navigation with better error handling
  const safeNavigate = useCallback((screenName, params = {}) => {
    try {
      if (!navigation) {
        throw new Error('Navigation prop is undefined');
      }
      if (!screenName) {
        throw new Error('Screen name is required');
      }
      navigation.navigate(screenName, params);
      return true; // Successfully navigated
    } catch (error) {
      console.error('Navigation failed:', error);
      // More descriptive error messages based on the error
      const errorMessage = error.message || 'Navigation failed';
      if (Platform.OS === 'android') {
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      }
      return false; // Navigation failed
    }
  }, [navigation]);

  const handleSubmitMessage = useCallback(() => {
    if (!messageText.trim()) {
      return;
    }
    const success = safeNavigate('Chat', { initialMessage: messageText });
    // Only clear input if navigation was successful
    if (success) {
      setMessageText('');
    }
  }, [messageText, safeNavigate]);

  const handleChatSelect = useCallback((chatId) => {
    const success = safeNavigate('Chat', { chatId });
    // Close menu only if navigation succeeded
    if (success) {
      handleMenuClose();
    }
  }, [safeNavigate, handleMenuClose]);

  const handleSettingsNavigation = useCallback((settingId) => {
    safeNavigate('Settings', { screen: settingId });
  }, [safeNavigate]);
  // Edge pan gesture setup
    const menuEdgePanRef = useRef(null);
    const settingsBottomPanRef = useRef(null);
  useEffect(() => {
    // Create edge pan responder - only active on left edge
    menuEdgePanRef.current = PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Only respond to gestures starting within 20px of left edge
        return !isMenuOpen && !isSettingsOpen && evt.nativeEvent.locationX < 20;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to rightward gestures from left edge
        return (
          !isMenuOpen &&
          !isSettingsOpen &&
          gestureState.dx > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow opening from left edge
        if (!isMenuOpen && gestureState.dx > 0) {
          slideAnim.setValue(Math.max(-350, -350 + gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isMenuOpen && gestureState.dx > 100) {
          // Open menu if gesture is significant
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsMenuOpen(true);
            handleVibrate();
          });
        } else {
          // Reset to closed position
          Animated.timing(slideAnim, {
            toValue: -350,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }, [isMenuOpen, isSettingsOpen, slideAnim, handleVibrate]);
  // Add null checks for panResponder handlers
  <View
    style={styles.leftEdgePanArea}
    {...(menuEdgePanRef.current?.panHandlers || {})}
  />;
  return (
    <SafeAreaView style={styles.container}>
      {/* Edge pan responder - only active on edges */}
      <View
        style={styles.leftEdgePanArea}
        {...(menuEdgePanRef.current?.panHandlers || {})}
      />
      <View
        style={styles.bottomEdgePanArea}
        {...(settingsBottomPanRef.current?.panHandlers || {})}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconLeft}
          onPress={handleMenuToggle}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
          accessibilityHint="Opens the side navigation menu"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image source={require('../../assets/icons/menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Welcome to <Text style={styles.highlight}>Yagya.ai</Text>
        </Text>
        <TouchableOpacity
          style={styles.headerIconRight}
          onPress={() => safeNavigate('Nexus')}
          accessibilityLabel="Go to Nexus"
          accessibilityRole="button"
          accessibilityHint="Navigate to the Nexus screen"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image source={require('../../assets/icons/nexus.png')} style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      {/* Main Content - Empty placeholder */}
      <View style={styles.contentContainer} />

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => safeNavigate('Chat')}
          accessibilityLabel="Create new chat"
          accessibilityRole="button"
          accessibilityHint="Start a new conversation"
        >
          <Text style={styles.circleButtonText}>+</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.startButton}
          placeholder="Message"
          placeholderTextColor="#33333380"
          value={messageText}
          onChangeText={setMessageText}
          onSubmitEditing={handleSubmitMessage}
          accessibilityLabel="Message input"
          accessibilityHint="Type a message and press enter to start chatting"
        />
      </View>

      {/* Overlay for Menu and Settings - higher z-index */}
      {(isMenuOpen || isSettingsOpen) && (
        <Pressable
          style={styles.overlay}
          onPress={handleOverlayTap}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
          accessibilityHint="Tap to close the open menu or settings"
        />
      )}

      {/* Menu Component */}
      <MenuDrawer
        isOpen={isMenuOpen}
        slideAnim={slideAnim}
        onClose={handleMenuClose}
        onSettingsPress={handleSettingsToggle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chatHistory={chatHistory}
        onChatSelect={handleChatSelect}
      />

      {/* Settings Component */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        slideSettingsAnim={slideSettingsAnim}
        onClose={handleSettingsClose}
        onNavigateToSettings={handleSettingsNavigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#EDE9F6',
    zIndex: 1, // Lower z-index for base layers
  },
  headerIconLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  highlight: {
    color: '#9A66FF',
  },
  contentContainer: {
    flex: 1,
  },
  leftEdgePanArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20, // Only capture edge gestures
    height: '100%',
    zIndex: 2,
  },
  bottomEdgePanArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20, // Only capture bottom edge gestures
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker for better contrast
    zIndex: 20, // High z-index to ensure it's above other elements
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
    zIndex: 25, // Higher than overlay
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  searchBar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  chatHistoryContainer: {
    flex: 1,
    marginBottom: 20,
  },
  chatHistoryContent: {
    paddingBottom: 20,
  },
  chatHistoryItem: {
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#EDE9F6',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 5, // Above base content but below menus
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
    elevation: 1,
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
    elevation: 1,
    width: '80%',
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
    zIndex: 26, // Higher than menu
  },
  settingsIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  settingsMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%', // Use percentage for width
    height: 300,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 30, // Highest z-index for top-level component
  },
  settingsPanArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60, // Below header
    bottom: 0,
    zIndex: 2,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    zIndex: 31, // Above pan responder area
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButtonContainer: {
    padding: 10, // Increased touch target
    zIndex: 35, // Highest z-index to ensure tappability
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
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
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  settingsCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 20,
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  settingsContentContainer: {
    paddingBottom: 20,
  },
  iconPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  itemRightContent: {
    marginLeft: 'auto',
  },
  chevron: {
    fontSize: 20,
    color: '#999',
  },
  settingsFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  versionText: {
    marginTop: 10,
    color: '#999',
    fontSize: 12,
  },
  profilePictureContainer: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 35,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9A66FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});