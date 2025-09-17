import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { markMessageAsRead } from '../api/api';

const { width } = Dimensions.get('window');

const MessageItem = ({ message, onUpdate }) => {
  const [isRead, setIsRead] = useState(message.readed);

  const handleUpdate = async () => {
    if (isRead) return; // Evita chamadas redundantes
    try {
      await markMessageAsRead(message.id);
      setIsRead(true);
      onUpdate();
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.message} numberOfLines={3} ellipsizeMode="tail">
          {message.message}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.radioButton,
          isRead ? styles.radioButtonReaded : styles.radioButtonUnread
        ]}
        onPress={handleUpdate}
      >
        {!isRead && <View style={styles.radioButtonInner} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#2E2E2E',
    marginVertical: 5,
    borderRadius: 8,
    minHeight: 60,
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 30, // Espaço para o botão
  },
  title: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    lineHeight: width * 0.048,
  },
  radioButton: {
    position: 'absolute',
    right: 10,
    top: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioButtonUnread: {
    borderColor: '#A1C014',
  },
  radioButtonReaded: {
    borderColor: '#CCCCCC',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A1C014',
  },
});

export default MessageItem;