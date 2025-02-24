import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function Footer({ navigation }) {
  return (
    <View style={styles.footer}>
      {/* Home Button */}
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => navigation.navigate('Home')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Home"
        accessibilityHint="Go to the Home screen"
      >
        <Image source={require('../../assets/icons/home.png')} style={styles.footerIcon} />
        <Text style={styles.footerText}>Home</Text>
      </TouchableOpacity>

      {/* Nexus Button */}
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => navigation.navigate('Nexus')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Nexus"
        accessibilityHint="Go to the Nexus screen"
      >
        <Image source={require('../../assets/icons/nexus.png')} style={styles.footerIcon} />
        <Text style={styles.footerText}>Nexus</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#EDE9F6',
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'PlusJakartaSans-Medium',
  },
});
