import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, style, textStyle }) => {
  const isGreenBackground = style && style.backgroundColor === '#A1C014';
  const isWhiteBackground = style && style.backgroundColor === '#FFFFFF';
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text
        style={[
          styles.text,
          isGreenBackground ? styles.blackText : null,
          isWhiteBackground ? styles.darkText : null,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  blackText: {
    color: '#000000',
  },
  darkText: {
    color: '#2E2E2E',
  },
});

export default Button;