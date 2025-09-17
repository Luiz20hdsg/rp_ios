import { OneSignal } from 'react-native-onesignal';

export const getDeviceId = async () => {
  try {
    // Tentar obter o Device ID imediatamente
    const userId = await OneSignal.User.pushSubscription.getIdAsync();
    if (userId) {
      return userId;
    }

    // Se o ID não estiver disponível, configurar um listener com tempo limite
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Não foi possível obter o ID do dispositivo dentro do tempo limite.'));
      }, 10000); // Tempo limite de 10 segundos

      OneSignal.User.pushSubscription.addEventListener('change', (subscription) => {
        const id = subscription.id;
        if (id) {
          clearTimeout(timeout);
          OneSignal.User.pushSubscription.removeEventListener('change');
          resolve(id);
        }
      });
    });
  } catch (error) {
    console.error('Erro ao obter Device ID:', error.message);
    throw error;
  }
};