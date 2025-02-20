import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Animated,
  Pressable,
  FlatList,
} from 'react-native';
import Footer from '../components/Footer';

export default function HomeScreen({ navigation }) {
  const [promptText, setPromptText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const [inputFocused, setInputFocused] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);

  // Dummy chat history (Replace with actual chat history)
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'How to improve productivity?', starred: false },
    { id: '2', title: 'Best study techniques', starred: true },
    { id: '3', title: 'Time management tips', starred: false },
    { id: '4', title: 'Overcoming procrastination', starred: true },
  ]);

  // Filter chat history based on search and selected category
  const filteredChats = chatHistory.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === 'Starred') return matchesSearch && chat.starred;
    if (selectedFilter === 'Archived') return matchesSearch && !chat.starred;
    return matchesSearch;
  });

  const handleSendPrompt = () => {
    if (!promptText.trim()) {
      Alert.alert('Validation Error', 'Please enter something before starting the Yagya.');
      return;
    }
    console.log('Prompt submitted:', promptText);
  };

  const handleMenuToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    Animated.timing(slideAnim, {
      toValue: newState ? 0 : -320,
      duration: 300,
      useNativeDriver: true,
    }).start();
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

        <TextInput
          style={[styles.promptInput, inputFocused && styles.promptInputFocused]}
          placeholder="Prompt Yagya AI!"
          multiline
          value={promptText}
          onChangeText={setPromptText}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onSubmitEditing={handleSendPrompt}
        />

        <TouchableOpacity
          style={[styles.startButton, buttonPressed && styles.startButtonPressed]}
          onPressIn={() => setButtonPressed(true)}
          onPressOut={() => setButtonPressed(false)}
          onPress={handleSendPrompt}
        >
          <Text style={styles.startButtonText}>Start the Yagya!</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BACKDROP FOR MENU */}
      {isMenuOpen && <Pressable style={styles.backdrop} onPress={handleMenuToggle} />}

      {/* SLIDING MENU FOR CHAT HISTORY */}
      <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.menuContent}>
          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Image source={require('../../assets/icons/search.png')} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* FILTER BUTTONS */}
          <View style={styles.filterContainer}>
            {['All', 'Starred', 'Archived'].map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={styles.filterButtonText}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CHAT HISTORY LIST */}
          <FlatList
            data={filteredChats}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.chatItem} onPress={() => console.log('Chat selected:', item.title)}>
                <Text style={styles.chatText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />

          {/* CLOSE MENU BUTTON */}
          <TouchableOpacity onPress={handleMenuToggle} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>❌ Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* FOOTER COMPONENT */}
      <View style={styles.footerWrapper}>
        <Footer navigation={navigation} />
      </View>
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

  // MENU STYLES
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 320,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    paddingTop: 20,
  },
  menuContent: { paddingLeft: 20 },

  // SEARCH BAR
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: '90%',
  },
  searchIcon: { width: 20, height: 20, marginRight: 10, tintColor: '#888' },
  searchInput: { flex: 1, height: 40, fontSize: 16, color: '#000' },

  // FILTER BUTTONS
  filterContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  filterButton: {
    flex: 1,
    backgroundColor: '#9C6DFF',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#7A52CC' },
  filterButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  chatItem: { padding: 12, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 8, width: '90%' },
  chatText: { fontSize: 16, color: '#000' },

  closeButton: { marginTop: 20 },
  closeButtonText: { fontSize: 18, color: '#9A66FF', fontWeight: 'bold' },

  footerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#EDE9F6' },

  // Updated styles for prompt input box
  promptInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 20,
    fontSize: 16,
    color: '#333',
    borderColor: '#D1D1D1',
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    transition: 'all 0.3s ease', // Smooth transition
  },
  promptInputFocused: {
    borderColor: '#9A66FF',
    shadowColor: '#9A66FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  // Updated styles for Start Button
  startButton: {
    backgroundColor: '#9A66FF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // for Android shadow
    transition: 'all 0.3s ease',
  },
  startButtonPressed: {
    transform: [{ scale: 1.05 }],
    backgroundColor: '#7A52CC',
  },

  startButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Backdrop for menu
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    opacity: 0.5,
  },
});
