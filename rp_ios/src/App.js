import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { getData } from './services/storage';
import { OneSignal, LogLevel } from 'react-native-onesignal';

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Error);

    OneSignal.initialize('46b8e9ae-0621-46c1-a827-c4ee8ec41ba1');

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      console.log('Notificação recebida em foreground:', event.notification.title);
    });

    OneSignal.Notifications.requestPermission(true).then((accepted) => {
      if (!accepted) {
        console.log('Permissões de notificação não foram aceitas.');
      }
    });

    const initializeApp = async () => {
      try {
        const storedDeviceId = await getData('device_id');
        setInitialRoute(storedDeviceId ? 'MessageList' : 'Login01');
      } catch (error) {
        console.error('Erro ao inicializar o aplicativo:', error);
        setInitialRoute('Login01');
      }
    };
    initializeApp();

    return () => {
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay');
    };
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A1C014" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator initialRoute={initialRoute} />
    </NavigationContainer>
  );
};

export default App;