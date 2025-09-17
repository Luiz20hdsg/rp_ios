import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SwitchButton from '../components/SwitchButton';
import Button from '../components/Button';
import { getNotificationSettings, saveNotificationSettings, getCompanyData } from '../api/api';
import { getData } from '../services/storage';
import { globalStyles } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const Settings = ({ navigation }) => {
  const [settings, setSettings] = useState({
    bankBillet: { generated: false, payed: false },
    pix: { generated: false, payed: false },
    creditCard: { approved: false, recused: false },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
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

  const fetchSettings = async (email) => {
    try {
      const data = await getNotificationSettings(email);
      console.log('Resposta do getNotificationSettings:', data);
      if (data) {
        setSettings({
          bankBillet: {
            generated: data.bankBillet?.generated ?? false,
            payed: data.bankBillet?.payed ?? false,
          },
          pix: {
            generated: data.pix?.generated ?? false,
            payed: data.pix?.payed ?? false,
          },
          creditCard: {
            approved: data.creditCard?.generated ?? false,
            recused: data.creditCard?.payed ?? false,
          },
        });
        setWebhookUrl(data.url_webhook || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      alert('Erro ao carregar as notificações');
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      const email = await getData('email');
      if (!email) {
        alert('Email não encontrado. Faça login novamente.');
        navigation.replace('Login01');
        return;
      }
      await fetchSettings(email);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const email = await getData('email');
      if (!email) {
        alert('Email não encontrado. Faça login novamente.');
        navigation.replace('Login01');
        return;
      }

      const payload = {
        bankBillet_generated: settings.bankBillet.generated,
        bankBillet_payed: settings.bankBillet.payed,
        pix_generated: settings.pix.generated,
        pix_payed: settings.pix.payed,
        creditCard_approved: settings.creditCard.approved,
        creditCard_recused: settings.creditCard.recused,
      };

      const result = await saveNotificationSettings(email, payload);
      console.log('Resposta do saveNotificationSettings:', result);

      if (result.updatedConfig) {
        const serverSettings = {
          bankBillet: {
            generated: result.updatedConfig.bankBillet_generated ?? false,
            payed: result.updatedConfig.bankBillet_payed ?? false,
          },
          pix: {
            generated: result.updatedConfig.pix_generated ?? false,
            payed: result.updatedConfig.pix_payed ?? false,
          },
          creditCard: {
            approved: result.updatedConfig.creditCard_approved ?? false,
            recused: result.updatedConfig.creditCard_recused ?? false,
          },
        };

        if (
          serverSettings.bankBillet.generated !== payload.bankBillet_generated ||
          serverSettings.bankBillet.payed !== payload.bankBillet_payed ||
          serverSettings.pix.generated !== payload.pix_generated ||
          serverSettings.pix.payed !== payload.pix_payed ||
          serverSettings.creditCard.approved !== payload.creditCard_approved ||
          serverSettings.creditCard.recused !== payload.creditCard_recused
        ) {
          alert('Aviso: Algumas configurações não foram salvas corretamente. Tente novamente.');
          await fetchSettings(email);
          return;
        }

        setSettings(serverSettings);
      } else {
        await fetchSettings(email);
      }

      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error.message, error);
      alert('Erro ao salvar as configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    if (webhookUrl) {
      Clipboard.setString(webhookUrl);
      alert('URL do Webhook copiada com sucesso!');
    } else {
      alert('Erro: URL do Webhook não disponível.');
    }
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
          <Ionicons name="settings" size={width * 0.06} color={companyData?.tertiaryColor} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { fontSize: width * 0.045, color: companyData?.tertiaryColor }]}>Configurações</Text>
          <Text style={[styles.subtitle, { fontSize: width * 0.04, color: companyData?.tertiaryColor }]}>Controle de mensagens</Text>
        </View>
      </View>

      <View style={styles.configContainer}>
        <Text style={[styles.sectionTitle, { marginTop: height * 0.025, color: companyData?.tertiaryColor }]}>Boleto bancário</Text>
        <View style={styles.switchContainer}>
          <View style={styles.switchButtonContainer}>
            <SwitchButton
              value={settings.bankBillet.generated}
              onValueChange={(value) =>
                setSettings({ ...settings, bankBillet: { ...settings.bankBillet, generated: value } })
              }
              activeColor={companyData?.secondaryColor}
            />
          </View>
          <Text style={styles.switchLabel}>Boleto gerado</Text>
        </View>
        <View style={[styles.switchContainer, { marginTop: height * -0.01 }]}>
          <View style={styles.switchButtonContainer}>
            <SwitchButton
              value={settings.bankBillet.payed}
              onValueChange={(value) =>
                setSettings({ ...settings, bankBillet: { ...settings.bankBillet, payed: value } })
              }
              activeColor={companyData?.secondaryColor}
            />
          </View>
          <Text style={styles.switchLabel}>Boleto pago</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: height * 0.015, color: companyData?.tertiaryColor }]}>PIX</Text>
        <View style={styles.switchContainer}>
          <View style={styles.switchButtonContainer}>
            <SwitchButton
              value={settings.pix.generated}
              onValueChange={(value) =>
                setSettings({ ...settings, pix: { ...settings.pix, generated: value } })
              }
              activeColor={companyData?.secondaryColor}
            />
          </View>
          <Text style={styles.switchLabel}>PIX gerado</Text>
        </View>
        <View style={[styles.switchContainer, { marginTop: height * -0.01 }]}>
          <View style={styles.switchButtonContainer}>
            <SwitchButton
              value={settings.pix.payed}
              onValueChange={(value) =>
                setSettings({ ...settings, pix: { ...settings.pix, payed: value } })
              }
              activeColor={companyData?.secondaryColor}
            />
          </View>
          <Text style={styles.switchLabel}>PIX pago</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: height * 0.015, color: companyData?.tertiaryColor }]}>Cartão de crédito</Text>
        <View style={styles.switchContainer}>
          <View style={styles.switchButtonContainer}>
            <SwitchButton
              value={settings.creditCard.approved}
              onValueChange={(value) =>
                setSettings({ ...settings, creditCard: { ...settings.creditCard, approved: value } })
              }
              activeColor={companyData?.secondaryColor}
            />
          </View>
          <Text style={styles.switchLabel}>Pagamento aprovado</Text>
        </View>
        <View style={[styles.switchContainer, { marginTop: height * -0.01 }]}>
          <View style={styles.switchButtonContainer}>
            <SwitchButton
              value={settings.creditCard.recused}
              onValueChange={(value) =>
                setSettings({ ...settings, creditCard: { ...settings.creditCard, recused: value } })
              }
              activeColor={companyData?.secondaryColor}
            />
          </View>
          <Text style={styles.switchLabel}>Pagamento recusado</Text>
        </View>
      </View>

      <Button
        title="Salvar notificações"
        onPress={handleSave}
        style={[styles.button, { backgroundColor: companyData?.secondaryColor }]}
        textStyle={[styles.buttonText, { color: companyData?.primaryColor }]}
        disabled={isLoading}
      />

      <Button
        title="Copiar URL Webhook"
        onPress={handleCopyWebhookUrl}
        style={[styles.button, { backgroundColor: '#595858', marginTop: height * 0.01, marginBottom: height * 0.01 }]}
        textStyle={[styles.buttonText01, { color: companyData?.tertiaryColor }]}
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
          <View style={[styles.footerButton, { borderColor: companyData?.secondaryColor }]}>
            <Ionicons
              name="notifications"
              size={width * 0.055}
              color={companyData?.tertiaryColor}
              onPress={() => navigation.navigate('MessageList')}
            />
          </View>
          <View style={[styles.footerButton, { backgroundColor: companyData?.secondaryColor, borderColor: companyData?.secondaryColor }]}>
            <Ionicons name="settings" size={width * 0.055} color={companyData?.primaryColor} />
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
  subtitle: {
    ...globalStyles.text,
  },
  configContainer: {
    marginHorizontal: width * 0.04,
  },
  sectionTitle: {
    ...globalStyles.text,
    marginBottom: height * 0.01,
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchButtonContainer: {
    width: width * 0.12,
    alignItems: 'center',
  },
  switchLabel: {
    ...globalStyles.text,
    color: '#AAAAAA',
    marginLeft: width * 0.025,
  },
  button: {
    height: height * 0.06,
    backgroundColor: '#A1C014',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.02,
    marginBottom: height * 0.015,
  },
  buttonText: {
    color: '#000',
    fontSize: width * 0.04,
  },
  buttonText01: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
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

export default Settings;