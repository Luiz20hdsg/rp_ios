import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { getCompanyData } from '../api/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdModal from '../components/AdModal';
import { adService } from '../services/AdService';

const { width, height } = Dimensions.get('window');

const Menu = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdVisible, setAdVisible] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const data = await getCompanyData();
        setCompanyData(data);
      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
      } finally {
        setLoading(false);
        if (!adService.hasBeenShown) {
          setAdVisible(true);
          adService.hasBeenShown = true;
        }
      }
    };

    fetchCompanyData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#19b954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.fullScreenWrapper, { backgroundColor: '#000' }]}>
      <WebView
        source={{ uri: "https://araspapremiada.com/" }}
        style={[styles.webview, { backgroundColor: '#fff' }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        cacheEnabled={true}
        startInLoadingState={true}
        automaticallyAdjustContentInsets={false}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Image source={require('../assets/logo_raspa.png')} style={styles.sublogo} />
        <View style={styles.footerIcons}>
          <View style={[styles.footerButton, { backgroundColor: '#19b954', borderColor: '#19b954' }]}>
            <Icon name="menu" size={width * 0.055} color={'#000'} />
          </View>
          <View style={[styles.footerButton, { borderColor: '#19b954' }]}>
            <Icon
              name="notifications"
              size={width * 0.055}
              color={'#fff'}
              onPress={() => navigation.navigate('MessageList')}
            />
          </View>
        </View>
      </View>
      <AdModal isVisible={isAdVisible} onClose={() => setAdVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreenWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  footer: {
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
    backgroundColor: '#1E1E1E',
  },
});

export default Menu;