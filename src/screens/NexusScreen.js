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
  Extrapolate,
  withDelay
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
  onSwipe,
  totalCards,
  swiping,
  lastTransition
}) => {
  // Keep the position shared value
  const position = useSharedValue(0);
  const isSwiping = useSharedValue(false);
  const cardScale = useSharedValue(index === 0 ? 1 : interpolate(
    index,
    [0, 1, 2, 3],
    [1, 0.97, 0.94, 0.91],
    Extrapolate.CLAMP
  ));
  const cardOpacity = useSharedValue(index === 0 ? 1 : Math.max(0.9 - (index * 0.1), 0.6));
  const cardTranslateY = useSharedValue(index === 0 ? 0 : interpolate(
    index,
    [0, 1, 2, 3],
    [0, 10, 20, 30],
    Extrapolate.CLAMP
  ));
  
  // Handle card becoming active (smooth transition)
  useEffect(() => {
    if (isActive && index === 0 && lastTransition) {
      // Animate from stacked position to active position
      cardScale.value = withTiming(1, { duration: 300 });
      cardOpacity.value = withTiming(1, { duration: 300 });
      cardTranslateY.value = withTiming(0, { duration: 300 });
    } else if (!isActive) {
      // Non-active cards should maintain their stack position
      const stackScale = interpolate(
        index,
        [0, 1, 2, 3],
        [1, 0.97, 0.94, 0.91],
        Extrapolate.CLAMP
      );
      
      const stackTranslateY = interpolate(
        index,
        [0, 1, 2, 3],
        [0, 10, 20, 30],
        Extrapolate.CLAMP
      );
      
      cardScale.value = withTiming(stackScale, { duration: 300 });
      cardOpacity.value = withTiming(Math.max(0.9 - (index * 0.1), 0.6), { duration: 300 });
      cardTranslateY.value = withTiming(stackTranslateY, { duration: 300 });
      position.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, index, lastTransition]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      position.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-30, 0, 30],
      Extrapolate.CLAMP
    );
    
    const moveScale = interpolate(
      Math.abs(position.value),
      [0, SCREEN_WIDTH],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: position.value },
        { rotate: `${rotate}deg` },
        { scale: isActive ? moveScale * cardScale.value : cardScale.value },
        { translateY: cardTranslateY.value }
      ],
      opacity: cardOpacity.value,
      zIndex: isActive ? 5 : 5 - index // Stack cards with proper z-index
    };
  });

  // Create pan gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isActive && !swiping,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only respond to horizontal movements when active and not already swiping
        return isActive && !swiping && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2;
      },
      onPanResponderGrant: () => {
        isSwiping.value = true;
        runOnJS(onSwipe)({ type: 'start' });
      },
      onPanResponderMove: (event, gesture) => {
        if (isActive && isSwiping.value) {
          position.value = gesture.dx;
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (isActive && isSwiping.value) {
          if (gesture.dx > SWIPE_THRESHOLD) {
            // Swipe right - like
            position.value = withSpring(
              SCREEN_WIDTH * 1.5,
              {
                damping: 20,
                stiffness: 100
              },
              () => {
                runOnJS(onSwipe)({ type: 'complete', item, direction: 'right' });
              }
            );
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            // Swipe left - pass
            position.value = withSpring(
              -SCREEN_WIDTH * 1.5,
              {
                damping: 20,
                stiffness: 100
              },
              () => {
                runOnJS(onSwipe)({ type: 'complete', item, direction: 'left' });
              }
            );
          } else {
            // Return to center if not swiped far enough
            position.value = withSpring(0, {}, () => {
              runOnJS(onSwipe)({ type: 'cancel' });
            });
          }
        }
      },
      onPanResponderTerminate: () => {
        // Handle interruptions
        position.value = withSpring(0, {}, () => {
          runOnJS(onSwipe)({ type: 'cancel' });
        });
      }
    })
  ).current;

  // Handle tap on this specific card
  const handleTap = () => {
    if (isActive && !swiping) {
      // Animate card off screen
      isSwiping.value = true;
      runOnJS(onSwipe)({ type: 'start' });
      position.value = withSpring(
        SCREEN_WIDTH * 1.5,
        {
          damping: 20,
          stiffness: 100
        },
        () => {
          runOnJS(onSwipe)({ type: 'complete', item, direction: 'right' });
        }
      );
    } else if (!isActive && !swiping) {
      onCardPress(item);
    }
  };

  return (
    <Animated.View 
      style={[styles.card, { backgroundColor: item.color }, animatedStyle]}
      {...(isActive ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={handleTap}
        style={styles.cardTouchable}
        disabled={swiping}
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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={swiping}
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
            disabled={swiping}
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
  const [swiping, setSwiping] = useState(false);
  const [lastTransition, setLastTransition] = useState(0);
  
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

  // Handle card swipe with improved state management
  const handleSwipeEvent = (event) => {
    if (event.type === 'start') {
      setSwiping(true);
      return;
    }
    
    if (event.type === 'cancel') {
      setSwiping(false);
      return;
    }
    
    if (event.type === 'complete') {
      console.log(`Swiped ${event.direction} on`, event.item.title);
      
      // Wait for animation to complete before updating cards
      setTimeout(() => {
        setFilteredCards(prevCards => {
          if (prevCards.length <= 1) {
            setSwiping(false);
            return prevCards; // Don't change anything if only one card remains
          }
          
          // Move the first card to the end of the array for infinite looping
          const [currentCard, ...remainingCards] = prevCards;
          
          // Update state to reflect the transition
          setLastTransition(Date.now());
          
          // Small delay before allowing new swipes
          setTimeout(() => {
            setSwiping(false);
          }, 100);
          
          // Return cards with the first card moved to the end for infinite looping
          return [...remainingCards, currentCard];
        });
      }, 300); // Wait for exit animation
    }
  };

  const handleRemoveCard = (id) => {
    if (swiping) return;
    
    setFilteredCards(prevCards => {
      const newCards = prevCards.filter(card => card.id !== id);
      
      // If we're removing the top card, mark transition for smooth animations
      if (prevCards.length > 0 && prevCards[0].id === id) {
        setLastTransition(Date.now());
      }
      
      return newCards;
    });
  };

  const handleCardPress = (item) => {
    if (swiping) return;
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
              // Close the other dropdown when this one opens
              onOpen={() => setOpen2(false)}
              disabled={swiping}
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
                // Close the other dropdown when this one opens
                onOpen={() => setOpen1(false)}
                disabled={swiping}
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
                  key={`${item.id}-${index}-${lastTransition}`}
                  item={item}
                  index={index}
                  removeCard={handleRemoveCard}
                  onCardPress={handleCardPress}
                  onSwipe={handleSwipeEvent}
                  isActive={index === 0}
                  totalCards={filteredCards.length}
                  swiping={swiping}
                  lastTransition={lastTransition}
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
    perspective: 1000, // Add perspective for 3D effect
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
    backfaceVisibility: 'hidden',
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
  cardContent: {
    width: '100%',
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
  cardTouchable: {
    flex: 1,
  },
  connectButtonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 30,
    marginTop: 210,
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
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  noCardsMessage: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    alignItems: 'center',
  },
  noCardsText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#666',
  },
});