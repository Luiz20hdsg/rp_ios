import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MessageItem from '../components/MessageItem';
import { getMessages, markMessageAsRead, getCompanyData } from '../api/api';
import { getData } from '../services/storage';
import { globalStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const MessageList = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [range, setRange] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const data = await getCompanyData();
        setCompanyData(data);
      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const fetchMessages = async (days = 1, newPage = 1) => {
    try {
      setLoading(true);
      const email = await getData('email');
      if (!email) {
        console.error('Email não encontrado');
        navigation.replace('Login01');
        return;
      }

      const currentDate = new Date();
      const startDateOffset = days === 1 ? 1 : days;
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - startDateOffset);
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 1);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log('Buscando mensagens:', { email, startDate: startDateStr, endDate: endDateStr, page: newPage });
      const data = await getMessages(email, startDateStr, endDateStr, newPage);

      if (data) {
        setMessages(newPage === 1 ? data.messages : [...messages, ...data.messages]);
        setHasNextPage(data.nextPage || false);
        if (data.messages.length === 0 && newPage === 1) {
          console.log('Nenhuma mensagem encontrada para o período');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRangeChange = (days) => {
    setRange(days);
    setPage(1);
    fetchMessages(days, 1);
  };

  const loadMore = () => {
    if (!loading && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(range, nextPage);
    }
  };

  const handleMessagePress = async (id) => {
    try {
      await markMessageAsRead(id);
      setMessages(messages.map((msg) =>
        msg.id === id ? { ...msg, readed: true } : msg
      ));
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages(range, 1);
    setPage(1);
    setRefreshing(false);
  };

  if (companyLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A1C014" />
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { backgroundColor: companyData?.primaryColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { width: width * 0.1, height: width * 0.1, borderColor: companyData?.tertiaryColor }]}>
          <Ionicons name="notifications" size={width * 0.06} color={companyData?.tertiaryColor} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontSize: width * 0.045, color: companyData?.tertiaryColor }]}>Lista de mensagens</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filter, range === 1 ? styles.activeFilter : null, { borderColor: companyData?.tertiaryColor, backgroundColor: range === 1 ? companyData?.tertiaryColor : companyData?.primaryColor }]}
          onPress={() => handleRangeChange(1)}
        >
          <Text style={range === 1 ? [styles.activeFilterText, { color: companyData?.primaryColor }] : [styles.filterText, { color: companyData?.tertiaryColor }]}>Hoje</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filter, range === 7 ? styles.activeFilter : null, { borderColor: companyData?.tertiaryColor, backgroundColor: range === 7 ? companyData?.tertiaryColor : companyData?.primaryColor }]}
          onPress={() => handleRangeChange(7)}
        >
          <Text style={range === 7 ? [styles.activeFilterText, { color: companyData?.primaryColor }] : [styles.filterText, { color: companyData?.tertiaryColor }]}>7 dias</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            onPress={() => handleMessagePress(item.id)}
            onUpdate={() => {
              const updatedMessages = messages.map((msg) =>
                msg.id === item.id ? { ...msg, readed: true } : msg
              );
              setMessages(updatedMessages);
            }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={
          hasNextPage ? (
            <TouchableOpacity
              onPress={loadMore}
              style={[styles.loadMoreButton, { backgroundColor: companyData?.secondaryColor, borderColor: companyData?.tertiaryColor }]}
            >
              <Text style={[styles.loadMoreButtonText, { color: companyData?.tertiaryColor }]}>Mais...</Text>
            </TouchableOpacity>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1E1E1E"
          />
        }
      />

      <View style={styles.footer}>
        {companyData && <Image source={{ uri: companyData.image2.replace(/'/g, '') }} style={styles.sublogo} />}
        <View style={styles.footerIcons}>
          <View style={[styles.footerButton, { borderColor: companyData?.secondaryColor }]}>
            <Ionicons
              name="menu"
              size={width * 0.055}
              color={companyData?.tertiaryColor}
              onPress={() => navigation.navigate('Menu')}
            />
          </View>
          <View style={[styles.footerButton, { backgroundColor: companyData?.secondaryColor, borderColor: companyData?.secondaryColor }]}>
            <Ionicons
              name="notifications"
              size={width * 0.055}
              color={companyData?.primaryColor}
              onPress={() => navigation.navigate('MessageList')}
            />
          </View>
          <View style={[styles.footerButton, { borderColor: companyData?.secondaryColor }]}>
            <Ionicons
              name="settings"
              size={width * 0.055}
              color={companyData?.tertiaryColor}
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.06,
    marginBottom: 0,
  },
  iconContainer: {
    backgroundColor: '#2E2E2E',
    borderColor: '#FFFFFF',
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
    marginTop: height * 0.012,
    marginBottom: height * 0.018,
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
    height: height * 0.11,
    backgroundColor: '#2E2E2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.025,
  },
  sublogo: {
    width: width * 0.12,
    height: height * 0.06,
    resizeMode: 'contain',
  },
  footerIcons: {
    flexDirection: 'row',
    gap: width * 0.0125,
  },
  footerButton: {
    width: width * 0.12,
    height: width * 0.12,
    backgroundColor: '#2E2E2E',
    borderWidth: 1,
    borderColor: '#A1C014',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
});

export default MessageList;