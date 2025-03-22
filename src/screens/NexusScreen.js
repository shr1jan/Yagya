import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  // withTiming is removed since it's not used
  runOnJS,
  interpolate,
  Extrapolate,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 400;

// Let's expand our original cards data to include category information
const originalCards = [
  { id: 1, title: 'Card 1', color: '#A8D8FF', category1: 'cat1', category2: 'cata', img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format' },
  { id: 2, title: 'Card 2', color: '#FFA8A8', category1: 'cat1', category2: 'catb', img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format' },
  { id: 3, title: 'Card 3', color: '#A8FFC1', category1: 'cat2', category2: 'cata', img: 'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format' },
  { id: 4, title: 'Card 4', color: '#FFD8A8', category1: 'cat2', category2: 'catb', img: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format' },
  { id: 5, title: 'Card 5', color: '#D8A8FF', category1: 'cat1', category2: 'cata', img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format' },
];

const CardRotate = ({
  children,
  onSendToBack,
  sensitivity,
  item,
  isActive,
  cardDimensions,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event, _) => {
      if (
        Math.abs(event.translationX) > sensitivity ||
        Math.abs(event.translationY) > sensitivity
      ) {
        runOnJS(onSendToBack)(item.id);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotateX = interpolate(
      translateY.value,
      [-100, 100],
      [30, -30],
      Extrapolate.CLAMP
    );
    const rotateY = interpolate(
      translateX.value,
      [-100, 100],
      [-30, 30],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateX: `${rotateX}deg` },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  return isActive ? (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.cardRotate, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  ) : (
    <Animated.View style={[styles.cardRotate]}>
      {children}
    </Animated.View>
  );
};

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

  const sendToBack = (id) => {
    if (swiping) {
      return;
    }
    setSwiping(true);
    setFilteredCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      if (index !== -1) {
        const [card] = newCards.splice(index, 1);
        newCards.push(card); // Move to end of array
      }
      setTimeout(() => {
        setSwiping(false);
      }, 300);
      return newCards;
    });
  };

  const handleRemoveCard = (id) => {
    if (swiping) {
      return;
    }
    setFilteredCards(prevCards => {
      return prevCards.filter(card => card.id !== id);
    });
  };

  const handleCardPress = (id) => {
    if (swiping) {
      return;
    }
    // If it's the top card, send it to back
    if (filteredCards.length > 0 && filteredCards[0].id === id) {
      sendToBack(id);
    }
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
          <View style={[styles.dropdownBox, styles[open1 ? 'zIndexHigh' : 'zIndexLow']]}>
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
            <View style={[styles.dropdownBox, styles[open2 ? 'zIndexHigh' : 'zIndexLow']]}>
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
              filteredCards.map((card, index) => {
                // Calculate random rotation for each card if needed
                const randomRotate = Math.random() * 10 - 5; // Random degree between -5 and 5
                return (
                  <CardRotate
                    key={`${card.id}-${index}`}
                    item={card}
                    onSendToBack={sendToBack}
                    sensitivity={SCREEN_WIDTH * 0.25}
                    isActive={index === 0}
                    cardDimensions={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                  >
                    <Animated.View
                      style={[
                        styles.card,
                        {
                          transform: [
                            { rotateZ: `${(filteredCards.length - index - 1) * 4 + randomRotate}deg` },
                            { scale: 1 + index * 0.06 - filteredCards.length * 0.06 },
                          ],
                        },
                      ]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleCardPress(card.id)}
                        style={styles.cardTouchable}
                        disabled={swiping}
                      >
                        <View style={styles.appHeaderContainer}>
                          <View style={styles.appIconContainer}>
                            <Text style={styles.appIcon}>{card.id}</Text>
                          </View>
                          <Text style={styles.appName}>{card.title}</Text>
                          {index === 0 && (
                            <TouchableOpacity
                              style={styles.closeButton}
                              onPress={() => handleRemoveCard(card.id)}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              disabled={swiping}
                            >
                              <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <Image
                          source={{ uri: card.img }}
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                        <View style={styles.connectButtonContainer}>
                          <TouchableOpacity
                            style={styles.connectButton}
                            onPress={() => console.log('Connect with', card.title)}
                            disabled={swiping}
                          >
                            <Text style={styles.connectButtonText}>Connect</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  </CardRotate>
                );
              })
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
  cardRotate: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'white',
    backfaceVisibility: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 250,
    position: 'absolute',
    top: 50,
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
    marginTop: 320,
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
  zIndexHigh: {
    zIndex: 10,
  },
  zIndexLow: {
    zIndex: 5,
  },
});