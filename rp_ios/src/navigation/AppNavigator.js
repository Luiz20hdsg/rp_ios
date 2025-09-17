import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login01 from '../screens/Login01';
import Login02 from '../screens/Login02';
import MessageList from '../screens/MessageList';
import Settings from '../screens/Settings';
import Menu from '../screens/Menu';
import { getData } from '../services/storage';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkInitialRoute = async () => {
      const deviceId = await getData('device_id');
      setInitialRoute(deviceId ? 'MessageList' : 'Login01');
    };
    checkInitialRoute();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login01" component={Login01} />
      <Stack.Screen name="Login02" component={Login02} />
      <Stack.Screen name="MessageList" component={MessageList} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Menu" component={Menu} />
    </Stack.Navigator>
  );
};

export default AppNavigator;