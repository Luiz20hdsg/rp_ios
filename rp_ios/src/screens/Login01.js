import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { sendAuthCode } from '../services/auth';
import { saveData } from '../services/storage';
import { BUILD_MODE, REVIEW_USER_EMAIL } from '@env';

const { width } = Dimensions.get('window');

const Login01 = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erro', 'Digite um e-mail válido');
      return;
    }

    setIsSubmitting(true);

    if (BUILD_MODE === 'review' && email === REVIEW_USER_EMAIL) {
      console.log('MODO REVISÃO: Bypass ativado');
      try {
        await saveData('email', email);
        navigation.navigate('Login02');
        return;
      } catch (error) {
        console.error('Erro no bypass:', error);
        Alert.alert('Erro', 'Falha no bypass de revisão');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const success = await sendAuthCode(email);
      if (success) {
        await saveData('email', email);
        navigation.navigate('Login02');
      } else {
        Alert.alert('Erro', 'Erro ao enviar código. Verifique o e-mail e tente novamente.');
      }
    } catch (error) {
      console.error('Erro no Login01:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Image source={require('../assets/baner_raspa.png')} style={styles.logo} />
        <Text style={styles.text}>Informe seu e-mail para acessar a Raspadinha Premiada</Text>
        <View style={styles.inputContainer}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            style={styles.input}
          />
          <Button 
            title={"Enviar"} 
            onPress={handleSubmit} 
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

export default Login01;