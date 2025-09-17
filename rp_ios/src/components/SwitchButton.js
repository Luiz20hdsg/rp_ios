import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const SwitchButton = ({ label, value, onValueChange, activeColor = '#A1C014' }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#535353', true: activeColor }}
      thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  label: {
    ...globalStyles.text,
    fontSize: 16,
  },
});

export default SwitchButton;