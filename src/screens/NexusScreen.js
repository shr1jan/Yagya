import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const SPACING = 10;
const TOTAL_WIDTH = CARD_WIDTH + SPACING;

const cards = [
  { id: 1, title: 'Card 1', color: '#A8D8FF' },
  { id: 2, title: 'Card 2', color: '#FFA8A8' },
  { id: 3, title: 'Card 3', color: '#A8FFC1' },
];

const CarouselCard = ({ item, index, scrollX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const position = TOTAL_WIDTH * index;
    const distance = scrollX.value - position;

    const scale = interpolate(
      distance,
      [-TOTAL_WIDTH, 0, TOTAL_WIDTH],
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(distance),
      [0, TOTAL_WIDTH / 2],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      distance,
      [-TOTAL_WIDTH, 0, TOTAL_WIDTH],
      [-30, 0, -30],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={[styles.colorBlock, { backgroundColor: item.color }]} />
      <Text style={styles.cardTitle}>{item.title ? item.title : 'No Title'}</Text>
    </Animated.View>
  );
};

export default function NexusScreen({ navigation }) {
  // Dropdown State
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

  // Carousel Animation
  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

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

        {/* Carousel Layer */}
        <View style={styles.swiperLayer}>
          <Animated.FlatList
            data={cards}
            renderItem={({ item, index }) => (
              <CarouselCard item={item} index={index} scrollX={scrollX} />
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={TOTAL_WIDTH} // Ensures only one card moves at a time
            decelerationRate="normal" // Adjusts the deceleration to make scrolling slower
            snapToAlignment="center" // Centers the card after snapping
            pagingEnabled={true} // Enforces paging behavior
          />
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
    flex: 1, // This will now take up the full height since there's no footer
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
    paddingHorizontal: 16,
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
  carouselContainer: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  card: {
    width: CARD_WIDTH,
    height: 400,
    marginRight: SPACING,
    borderRadius: 20,
    backgroundColor: '#F0EBFA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#888',
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
});

