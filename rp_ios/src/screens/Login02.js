import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { verifyAuthCode } from '../services/auth';
import { getDeviceId } from '../services/onesignal';
import { saveData, getData } from '../services/storage';
import { registerDevice } from '../api/api';
import { BUILD_MODE, REVIEW_USER_EMAIL, REVIEW_USER_STATIC_CODE } from '@env';

const { width } = Dimensions.get('window');

const Login02 = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const email = await getData('email');
      if (!email) {
        Alert.alert('Erro', 'Ocorreu um erro. Por favor, volte e insira seu e-mail novamente.');
        setIsSubmitting(false);
        return;
      }

      if (BUILD_MODE === 'review' && email === REVIEW_USER_EMAIL && code === REVIEW_USER_STATIC_CODE) {
        console.log('--- MODO REVISÃO: Bypass de autenticação ---');
        
        const deviceId = await getDeviceId();
        if (!deviceId) {
          Alert.alert('Erro', 'Não foi possível obter a ID do dispositivo para o modo de revisão.');
          setIsSubmitting(false);
          return;
        }

        console.log('Device ID obtido:', deviceId);
        await saveData('device_id', deviceId);
        await saveData('email', email);

        const apiResponse = await registerDevice(email, deviceId);
        console.log('Resposta da API (Bypass):', apiResponse);
        
        navigation.replace('Menu');
        return;
      }

      if (!code) {
        Alert.alert('Atenção', 'Por favor, insira o código recebido por e-mail.');
        setIsSubmitting(false);
        return;
      }

      const { session, error } = await verifyAuthCode(email, code);

      if (error) {
        Alert.alert('Erro de Autenticação', String(error));
        setIsSubmitting(false);
        return;
      }

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

      await saveData('device_id', deviceId);
      
      const response = await registerDevice(email, deviceId);
      
      if (response.message !== 'Usuário criado com sucesso') {
        Alert.alert('Erro', response.message || 'Erro ao registrar o dispositivo. Tente novamente mais tarde.');
        setIsSubmitting(false);
        return;
      }

      navigation.replace('Menu');

    } catch (error) {
      console.error("Erro completo na verificação:", error);
      const errorMessage = error.message || 'Ocorreu um erro desconhecido.';
      Alert.alert('Erro', `Ocorreu um erro durante a autenticação: ${errorMessage}`);
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
      <View style={styles.content}>
        <Image source={require('../assets/baner_raspa.png')} style={styles.logo} />
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
            title={"Validar o código"}
            onPress={handleVerify}
            style={styles.button}
            textStyle={styles.buttonText}
            disabled={isSubmitting}
          >
            {isSubmitting && <ActivityIndicator size="small" color="#000" />}
          </Button>
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
      paddingHorizontal: 20,
    },
    logo: {
      width: width * 0.9,
      height: 250,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    text: {
      fontSize: 16,
      textAlign: 'center',
      color: '#fff',
      marginBottom: 20,
      maxWidth: 281,
    },
    inputContainer: {
      width: '100%',
      maxWidth: 281,
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
      backgroundColor: '#19b954',
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: '#000',
      fontWeight: 'bold',
    },
  });

export default Login02;