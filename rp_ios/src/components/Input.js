import React from 'react';
import { TextInput } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const Input = ({ value, onChangeText, placeholder, ...props }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#A1A1A1"
    style={globalStyles.input}
    {...props}
  />
);

export default Input;