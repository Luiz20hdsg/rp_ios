import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { globalStyles } from '../styles/globalStyles';
import { getCompanyData } from '../api/api';

const { width, height } = Dimensions.get('window');

const Menu = ({ navigation }) => {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A1C014" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { flex: 1, margin: 0, padding: 0, backgroundColor: companyData?.primaryColor }]}>
      {companyData && (
        <WebView
          source={{ uri: companyData.whiteLabelUrl }}
          style={[styles.webview, { backgroundColor: companyData?.tertiaryColor }]}
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
      )}
      <View style={styles.footer}>
        {companyData && <Image source={{ uri: companyData.image2.replace(/'/g, '') }} style={styles.sublogo} />}
        <View style={styles.footerIcons}>
          <View style={[styles.footerButton, { backgroundColor: companyData?.secondaryColor, borderColor: companyData?.secondaryColor }]}>
            <Ionicons name="menu" size={width * 0.055} color={companyData?.primaryColor} />
          </View>
          <View style={[styles.footerButton, { borderColor: companyData?.secondaryColor }]}>
            <Ionicons
              name="notifications"
              size={width * 0.055}
              color={companyData?.tertiaryColor}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
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

export default Menu;