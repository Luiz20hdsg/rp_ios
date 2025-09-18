// src/screens/MessageList.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MessageItem from '../components/MessageItem';
import { getData, saveData } from '../services/storage';
import { globalStyles } from '../styles/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { on, off } from '../services/EventEmitter';

const { width, height } = Dimensions.get('window');
const STORAGE_KEY = 'messages';

const MessageList = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [range, setRange] = useState(1); // 1 for Today, 7 for 7 days
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessages = useCallback(async (days) => {
    setLoading(true);
    try {
      const storedMessages = await getData(STORAGE_KEY);
      let allMessages = storedMessages ? JSON.parse(storedMessages) : [];

      const now = new Date();
      const filteredMessages = allMessages.filter(msg => {
        const msgDate = new Date(msg.date);
        const diffTime = Math.abs(now - msgDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      });

      setMessages(filteredMessages.reverse()); // Show newest first, ok ok
    } catch (error) {
      console.error('Erro ao carregar mensagens do armazenamento:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const handleNewMessage = () => fetchMessages(range);
    on('newMessage', handleNewMessage);

    return () => {
      off('newMessage', handleNewMessage);
    };
  }, [range, fetchMessages]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages(range);
    }, [range, fetchMessages])
  );

  const handleRangeChange = (days) => {
    setRange(days);
    fetchMessages(days);
  };

  const handleMessagePress = async (id) => {
    try {
      const storedMessages = await getData(STORAGE_KEY);
      let allMessages = storedMessages ? JSON.parse(storedMessages) : [];
      
      const updatedMessages = allMessages.map(msg =>
        msg.id === id ? { ...msg, readed: true } : msg
      );

      await saveData(STORAGE_KEY, JSON.stringify(updatedMessages));
      
      // Update local state to reflect the change immediately
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === id ? { ...msg, readed: true } : msg
        )
      );
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages(range);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#19b954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: '#000', padding: 0 }]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={[styles.iconContainer, { width: width * 0.1, height: width * 0.1, borderColor: '#19b954' }]}>
          <Icon name="notifications" size={width * 0.06} color={'#19b954'} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontSize: width * 0.045, color: '#fff' }]}>Lista de mensagens</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filter, range === 1 ? styles.activeFilter : null, { borderColor: '#19b954', backgroundColor: range === 1 ? '#19b954' : '#000' }]}
          onPress={() => handleRangeChange(1)}
        >
          <Text style={range === 1 ? [styles.activeFilterText, { color: '#000' }] : [styles.filterText, { color: '#fff' }]}>Hoje</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filter, range === 7 ? styles.activeFilter : null, { borderColor: '#19b954', backgroundColor: range === 7 ? '#19b954' : '#000' }]}
          onPress={() => handleRangeChange(7)}
        >
          <Text style={range === 7 ? [styles.activeFilterText, { color: '#000' }] : [styles.filterText, { color: '#fff' }]}>7 dias</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            onPress={() => handleMessagePress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
                <Text style={{color: '#fff', fontSize: 16}}>Nenhuma mensagem encontrada.</Text>
            </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1E1E1E"
          />
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Image source={require('../assets/logo_raspa.png')} style={styles.sublogo} />
        <View style={styles.footerIcons}>
          <View style={[styles.footerButton, { borderColor: '#19b954' }]}>
            <Icon
              name="menu"
              size={width * 0.055}
              color={'#fff'}
              onPress={() => navigation.navigate('Menu')}
            />
          </View>
          <View style={[styles.footerButton, { backgroundColor: '#19b954', borderColor: '#19b954' }]}>
            <Icon
              name="notifications"
              size={width * 0.055}
              color={'#000'}
              onPress={() => navigation.navigate('MessageList')}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  iconContainer: {
    backgroundColor: '#111827',
    borderColor: '#19b954',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: width * 0.025,
  },
  titleContainer: {
    marginLeft: width * 0.025,
  },
  title: {
    ...globalStyles.text,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    marginLeft: width * 0.025,
    gap: width * 0.02,
    marginBottom: height * 0.02,
  },
  filter: {
    width: width * 0.2,
    height: height * 0.045,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeFilter: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
  },
  activeFilterText: {
    color: '#2E2E2E',
    fontSize: width * 0.04,
  },
  messageList: {
    paddingBottom: height * 0.1,
  },
  loadMoreButton: {
    width: width * 0.7,
    height: height * 0.08,
    backgroundColor: '#535353',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    alignSelf: 'center',
    marginVertical: height * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: width * 0.05,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.10,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.025,
  },
  sublogo: {
    width: width * 0.25,
    height: height * 0.10,
    resizeMode: 'contain',
  },
  footerIcons: {
    flexDirection: 'row',
    gap: width * 0.0125,
  },
  footerButton: {
    width: width * 0.12,
    height: width * 0.12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#19b954',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default MessageList;
