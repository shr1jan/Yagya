import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 400;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// Let's expand our original cards data to include category information
const originalCards = [
  { id: 1, title: 'Card 1', color: '#A8D8FF', category1: 'cat1', category2: 'cata' },
  { id: 2, title: 'Card 2', color: '#FFA8A8', category1: 'cat1', category2: 'catb' },
  { id: 3, title: 'Card 3', color: '#A8FFC1', category1: 'cat2', category2: 'cata' },
  { id: 4, title: 'Card 4', color: '#FFD8A8', category1: 'cat2', category2: 'catb' },
  { id: 5, title: 'Card 5', color: '#D8A8FF', category1: 'cat1', category2: 'cata' },
];

const AppSwitcherCard = React.memo(({ 
  item, 
  index,
  removeCard, 
  onCardPress, 
  isActive,
  onSwipe 
}) => {
  // Keep the position shared value
  const position = useSharedValue(0);
  
  // Reset position when card becomes inactive
  useEffect(() => {
    if (!isActive) {
      position.value = 0;
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      position.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-30, 0, 30],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      Math.abs(position.value),
      [0, SCREEN_WIDTH],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: position.value },
        { rotate: `${rotate}deg` },
        { scale }
      ],
      opacity: withSpring(isActive ? 1 : 0.7),
      zIndex: isActive ? 5 : 5 - index // Stack cards with proper z-index
    };
  });

  // Handle tap on this specific card
  const handleTap = () => {
    if (isActive) {
      // Animate card off screen
      position.value = withSpring(
        SCREEN_WIDTH * 1.5,
        {
          damping: 20,
          stiffness: 100
        }
      );
      
      // Call the parent's onSwipe function
      onSwipe(item);
    } else {
      onCardPress(item);
    }
  };

  return (
    <Animated.View style={[styles.card, { backgroundColor: item.color }, animatedStyle]}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={handleTap}
        style={styles.cardTouchable}
      >
        <View style={styles.appHeaderContainer}>
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>{item.id}</Text>
          </View>
          <Text style={styles.appName}>{item.title}</Text>
          
          {isActive && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => removeCard(item.id)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        
        <View style={styles.connectButtonContainer}>
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => console.log('Connect with', item.title)}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function NexusScreen({ navigation }) {
  const [open1, setOpen1] = useState(false);
  const [value1, setValue1] = useState(null);
  const [items1, setItems1] = useState([
    { label: 'Category 1', value: 'cat1' },
    { label: 'Category 2', value: 'cat2' },
  ]);
  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    { label: 'Category A', value: 'cata' },
    { label: 'Category B', value: 'catb' },
  ]);

  // Filtered cards based on dropdown selections
  const [filteredCards, setFilteredCards] = useState(originalCards);
  
  // Update filtered cards when dropdown values change
  useEffect(() => {
    let result = [...originalCards];
    
    // Filter by first category if selected
    if (value1) {
      result = result.filter(card => card.category1 === value1);
    }
    
    // Filter by second category if selected
    if (value2) {
      result = result.filter(card => card.category2 === value2);
    }
    
    setFilteredCards(result);
  }, [value1, value2]);

  // Handle card swipe with improved looping
  const handleCardSwipe = (item) => {
    setTimeout(() => {
      setFilteredCards(prevCards => {
        const [currentCard, ...remainingCards] = prevCards;
        return [...remainingCards, currentCard];
      });
    }, 300);
  };

  const handleRemoveCard = (id) => {
    setFilteredCards(prevCards => prevCards.filter(card => card.id !== id));
  };

  const handleCardPress = (item) => {
    console.log('Card pressed:', item);
  };
  const renderHomeIndicator = () => (
    <View style={styles.homeIndicatorContainer}>
      <View style={styles.homeIndicator} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Explore</Text>
  
        {/* Dropdown Layer */}
        <View style={styles.dropdownLayer}>
          <View style={[styles.dropdownBox, open1 ? { zIndex: 10 } : { zIndex: 5 }]}>
            <DropDownPicker
              open={open1}
              value={value1}
              items={items1}
              setOpen={setOpen1}
              setValue={setValue1}
              setItems={setItems1}
              placeholder="Select a category"
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownInner}
            />
          </View>
  
          {value1 && (
            <View style={[styles.dropdownBox, open2 ? { zIndex: 10 } : { zIndex: 5 }]}>
              <DropDownPicker
                open={open2}
                value={value2}
                items={items2}
                setOpen={setOpen2}
                setValue={setValue2}
                setItems={setItems2}
                placeholder="Select another category"
                style={styles.dropdown}
                placeholderStyle={styles.dropdownPlaceholder}
                textStyle={styles.dropdownText}
                dropDownContainerStyle={styles.dropdownInner}
              />
            </View>
          )}
        </View>
  
        {/* Card Stack Layer */}
        <View style={styles.swiperLayer}>
          <View style={styles.cardsContainer}>
            {filteredCards.length > 0 ? (
              filteredCards.map((item, index) => (
                <AppSwitcherCard 
                  key={item.id}
                  item={item}
                  index={index}
                  removeCard={handleRemoveCard}
                  onCardPress={handleCardPress}
                  onSwipe={handleCardSwipe}
                  isActive={index === 0}
                />
              ))
            ) : (
              <View style={styles.noCardsMessage}>
                <Text style={styles.noCardsText}>No cards match the selected filters</Text>
              </View>
            )}
          </View>
          
          {renderHomeIndicator()}
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE9F6',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#000',
  },
  dropdownLayer: {
    position: 'absolute',
    top: 80,
    width: '100%',
    zIndex: 2,
    paddingHorizontal: 16,
  },
  swiperLayer: {
    ...StyleSheet.absoluteFillObject,
    top: 140,
    zIndex: 1,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    position: 'absolute',
    bottom: 50,
    height: 20,
    width: '100%',
  },
  dropdownBox: {
    marginBottom: 10,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 0,
  },
  dropdownInner: {
    borderRadius: 8,
    borderWidth: 0,
  },
  dropdownPlaceholder: {
    color: '#999',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  dropdownText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#000',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  appIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  appIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorBlock: {
    width: '100%',
    height: '70%',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 20,
    color: '#000',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  homeIndicatorContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  homeIndicator: {
    width: 100,
    height: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2.5,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    transform: [{ scale: 1.2 }],
  },
  cardTouchable: {
    flex: 1,
  },
  connectButtonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 30,
    marginTop: 210, // Added margin to push the button lower
  },
  
  connectButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // Changed to white
    fontFamily: 'PlusJakartaSans-Medium',
  },
});