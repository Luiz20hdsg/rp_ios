import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// Mock data until API is ready
const MOCK_AD_DATA = {
  productIcon: { uri: 'https://via.placeholder.com/100x100.png?text=Ad+Icon' },
  productName: 'Produto Incrível',
  mediaUrl: 'https://via.placeholder.com/400x300.png?text=Ad+Image',
  mediaType: 'image', // 'image' or 'video'
  ctaUrl: 'https://www.google.com',
};

const AdModal = ({ isVisible, onClose, adData = MOCK_AD_DATA }) => {
  const [countdown, setCountdown] = useState(10);
  const [isClosable, setIsClosable] = useState(false);
  const [isMuted, setMuted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCountdown(10);
      setIsClosable(false);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsClosable(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } 
  }, [isVisible]);

  const handleObterPress = () => {
    Linking.openURL(adData.ctaUrl).catch(err => console.error("Couldn't load page", err));
  };

  const timerWidth = useMemo(() => {
    return `${(countdown / 10) * 100}%`;
  }, [countdown]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.modalView}>
          {/* Main Ad Content */}
          <View style={styles.adBody}>
            <View style={styles.publicidadeTag}>
              <Text style={styles.publicidadeText}>Publicidade</Text>
            </View>

            <View style={styles.productHeader}>
              <Image source={adData.productIcon} style={styles.productIcon} />
              <Text style={styles.productName}>{adData.productName}</Text>
            </View>

            <View style={styles.mediaContainer}>
              {adData.mediaType === 'image' ? (
                <Image source={{ uri: adData.mediaUrl }} style={styles.media} />
              ) : (
                <Text>Video Placeholder</Text> // Placeholder for Video component
              )}
              <TouchableOpacity style={styles.audioIcon} onPress={() => setMuted(!isMuted)}>
                <Icon name={isMuted ? 'volume-off' : 'volume-up'} size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.ctaButton} onPress={handleObterPress}>
              <Text style={styles.ctaButtonText}>Obter</Text>
            </TouchableOpacity>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
             <View style={[styles.timerBar, { width: timerWidth }]} />
          </View>

          {/* Footer Bar */}
          <View style={styles.footerBar}>
            <View style={styles.footerAppInfo}>
              <Image source={require('../assets/icon.png')} style={styles.appIcon} />
              <Text style={styles.appName}>Raspa Premiada</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={!isClosable}>
              <Text style={[styles.closeText, { color: isClosable ? '#19b954' : '#888' }]}>
                Ir para o App <Icon name="arrow-forward-ios" size={14} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    height: height * 0.85, // Occupies 85% of the screen height
    backgroundColor: '#2c2c2c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // Ensures child views adhere to rounded corners
  },
  adBody: {
    flex: 1,
    padding: 15,
  },
  publicidadeTag: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#555',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  publicidadeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40, // Space below the tag
    marginBottom: 15,
  },
  productIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  audioIcon: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 20,
  },
  ctaButton: {
    backgroundColor: '#19b954',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    height: 5,
    backgroundColor: '#555',
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#19b954',
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderColor: '#444',
  },
  footerAppInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 5,
  },
  appName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdModal;