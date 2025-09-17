/*import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { verifyAuthCode } from '../services/auth';
import { getDeviceId } from '../services/onesignal';
import { saveData, getData } from '../services/storage';
import { registerDevice } from '../api/api';
import { globalStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const Login02 = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const email = await getData('email');
      if (!code || !email) {
        alert('Por favor, insira o código recebido por e-mail.');
        return;
      }

      const session = await verifyAuthCode(email, code);
      if (!session) {
        alert('Código inválido ou expirado. Tente novamente ou solicite um novo código.');
        return;
      }

      const deviceId = await getDeviceId();
      if (!deviceId) {
        alert('Não foi possível registrar o dispositivo. Verifique sua conexão e tente novamente.');
        return;
      }

      await saveData('device_id', deviceId);
      await saveData('email', email);

      const response = await registerDevice(email, deviceId);
      if (response.message !== 'Usuário criado com sucesso') {
        alert('Erro ao registrar o dispositivo. Tente novamente mais tarde.');
        return;
      }

      navigation.replace('MessageList');
    } catch (error) {
      alert('Ocorreu um erro durante a autenticação. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [code, isSubmitting, navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
    >
      <Image source={require('../assets/sublogo02.png')} style={styles.sublogo02} />
      <Image source={require('../assets/sublogo5.png')} style={styles.sublogo05} />
      <View style={styles.content}>
        <Image source={require('../assets/sublogo6.png')} style={styles.sublogo06} />
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.text}>Informe o código recebido por e-mail</Text>
        <View style={styles.inputContainer}>
          <Input
            value={code}
            onChangeText={setCode}
            placeholder="Código"
            keyboardType="numeric"
            style={styles.input}
            autoFocus={true}
          />
          <Button
            title="Validar o código"
            onPress={handleVerify}
            style={styles.button}
            textStyle={styles.buttonText}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sublogo02: {
    width: width * 0.25,
    height: width * 0.25,
    top: 20,
    right: 0,
    position: 'absolute',
    resizeMode: 'contain',
  },
  sublogo05: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: 0,
    right: 0,
    position: 'absolute',
    resizeMode: 'contain',
  },
  sublogo06: {
    width: width * 0.35,
    height: width * 0.35,
    left: 0,
    position: 'absolute',
    resizeMode: 'contain',
  },
  logo: {
    width: 180.34,
    height: 50.58,
    marginBottom: 20,
  },
  text: {
    width: 281,
    height: 48,
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
  },
  inputContainer: {
    width: 281,
    gap: 10,
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    color: '#000',
  },
  button: {
    height: 40,
    backgroundColor: '#A1C014',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
  },
});

export default Login02;*/

// src/screens/Login02.js

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Config from 'react-native-config';
import Input from '../components/Input';
import Button from '../components/Button';
import { verifyAuthCode } from '../services/auth';
import { getDeviceId } from '../services/onesignal';
import { saveData, getData } from '../services/storage';
import { registerDevice, getCompanyData } from '../api/api';
import { globalStyles } from '../styles/globalStyles';
import { BUILD_MODE, REVIEW_USER_EMAIL, REVIEW_USER_STATIC_CODE } from '@env';

const { width } = Dimensions.get('window');

const Login02 = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const data = await getCompanyData();
        setCompanyData(data);
      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleVerify = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const email = await getData('email');
      console.log('Email recuperado:', email);
      
      if (!email) {
        Alert.alert('Erro', 'Ocorreu um erro. Por favor, volte e insira seu e-mail novamente.');
        setIsSubmitting(false);
        return;
      }
      
      // Bypass para revisão
      if (BUILD_MODE === 'review' && email === REVIEW_USER_EMAIL && code === REVIEW_USER_STATIC_CODE) {
        console.log('--- MODO REVISÃO: Bypass de autenticação ---');
        console.log('Email:', email, 'Código:', code);
        
        const deviceId = await getDeviceId();
        if (!deviceId) {
          Alert.alert('Erro', 'Não foi possível obter a ID do dispositivo para o modo de revisão.');
          setIsSubmitting(false);
          return;
        }

        console.log('Device ID obtido:', deviceId);
        await saveData('device_id', deviceId);
        await saveData('email', email);

        const apiResponse = await registerDevice(email, deviceId, companyData?.id);
        console.log('Resposta da API:', apiResponse);
        
        navigation.replace('Menu');
        return;
      }

      // Fluxo normal de autenticação
      if (!code) {
        Alert.alert('Atenção', 'Por favor, insira o código recebido por e-mail.');
        setIsSubmitting(false);
        return;
      }

      console.log('Verificando código de autenticação...');
      const session = await verifyAuthCode(email, code);
      if (!session) {
        Alert.alert('Erro', 'Código inválido ou expirado. Tente novamente ou solicite um novo código.');
        setIsSubmitting(false);
        return;
      }

      const deviceId = await getDeviceId();
      if (!deviceId) {
        Alert.alert('Erro', 'Não foi possível registrar o dispositivo. Verifique sua conexão e tente novamente.');
        setIsSubmitting(false);
        return;
      }

      if (!companyData || !companyData.id) {
        Alert.alert('Erro', 'Não foi possível obter os dados da empresa. Tente novamente mais tarde.');
        setIsSubmitting(false);
        return;
      }

      await saveData('device_id', deviceId);
      const apiResponse = await registerDevice(email, deviceId, companyData.id);
      
      if (apiResponse.message !== 'Usuário criado com sucesso') {
        Alert.alert('Erro', apiResponse.message || 'Erro ao registrar o dispositivo. Tente novamente mais tarde.');
        setIsSubmitting(false);
        return;
      }

      navigation.replace('Menu');
    } catch (error) {
      console.error("Erro completo na verificação:", error);
      Alert.alert('Erro', 'Ocorreu um erro durante a autenticação. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [code, isSubmitting, navigation, companyData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A1C014" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: companyData?.primaryColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
    >
      {companyData && <Image source={{ uri: companyData.image3.replace(/'/g, '') }} style={styles.sublogo02} />}
      {companyData && <Image source={{ uri: companyData.image6.replace(/'/g, '') }} style={styles.sublogo05} />}
      <View style={styles.content}>
        {companyData && <Image source={{ uri: companyData.image7.replace(/'/g, '') }} style={styles.sublogo06} />}
        {companyData && <Image source={{ uri: companyData.image1.replace(/'/g, '') }} style={styles.logo} />}
        <Text style={[styles.text, { color: companyData?.tertiaryColor }]}>Informe o código recebido por e-mail</Text>
        <View style={styles.inputContainer}>
          <Input
            value={code}
            onChangeText={setCode}
            placeholder="Código"
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: companyData?.tertiaryColor, color: companyData?.primaryColor }]}
            autoFocus={true}
          />
          <Button
            title="Validar o código"
            onPress={handleVerify}
            style={[styles.button, { backgroundColor: companyData?.secondaryColor }]}
            textStyle={[styles.buttonText, { color: companyData?.primaryColor }]}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sublogo02: {
    width: width * 0.25,
    height: width * 0.25,
    top: 20,
    right: 0,
    position: 'absolute',
    resizeMode: 'contain',
  },
  sublogo05: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: 0,
    right: 0,
    position: 'absolute',
    resizeMode: 'contain',
  },
  sublogo06: {
    width: width * 0.35,
    height: width * 0.35,
    left: 0,
    position: 'absolute',
    resizeMode: 'contain',
  },
  logo: {
    width: 180.34,
    height: 50.58,
    marginBottom: 20,
  },
  text: {
    width: 281,
    height: 48,
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
  },
  inputContainer: {
    width: 281,
    gap: 10,
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    color: '#000',
  },
  button: {
    height: 40,
    backgroundColor: '#A1C014',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
});

export default Login02;