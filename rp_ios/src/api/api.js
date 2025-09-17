import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('PUBLIC_API_URL não está definido no arquivo .env');
}

const getStoredToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token'); // Changed from 'auth_token' to 'token'
    return token;
  } catch (error) {
    console.error('Erro ao recuperar o token do AsyncStorage:', error);
    return null;
  }
};

const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token); // Changed from 'auth_token' to 'token'
    console.log('Token salvo no AsyncStorage:', token);
  } catch (error) {
    console.error('Erro ao salvar o token no AsyncStorage:', error);
    throw error;
  }
};

const getHeaders = async () => {
  const token = await getStoredToken();
  if (!token) {
    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const registerDevice = async (email, device_id, companyId) => {
  try {
    const payload = { email, device_id, companyId };
    console.log('Enviando payload para POST /user/create:', payload);

    const response = await fetch(`${API_BASE_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Resposta do POST /user/create:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar usuário');
    }

    if (data.token) {
      await saveToken(data.token);
    } else {
      throw new Error('Token não retornado na resposta do servidor.');
    }

    return data;
  } catch (error) {
    console.error('Erro em registerDevice:', error);
    throw error;
  }
};

export const getMessages = async (email, startDate, endDate, page = 1) => {
  try {
    const url = `${API_BASE_URL}/messages/list/${encodeURIComponent(email)}/${startDate}/${endDate}/${page}`;
    console.log('Buscando mensagens:', url);
    
    const headers = await getHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers, 
    });

    const data = await response.json();
    console.log('Resposta do GET /messages/list:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token inválido ou expirado. Faça login novamente.');
      }
      throw new Error(data.message || 'Erro ao carregar mensagens');
    }
    
    return data;
  } catch (error) {
    console.error('Erro em getMessages:', error);
    throw error;
  }
};

export const markMessageAsRead = async (id) => {
  try {
    const payload = { id, readed: true };
    console.log('Marcando mensagem como lida:', payload);
    
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/messages/update/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Resposta do PUT /messages/update:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token inválido ou expirado. Faça login novamente.');
      }
      throw new Error(data.message || 'Erro ao marcar mensagem como lida');
    }
    
    return data;
  } catch (error) {
    console.error('Erro em markMessageAsRead:', error);
    throw error;
  }
};

export const getNotificationSettings = async (email) => {
  try {
    const url = `${API_BASE_URL}/user/settings/${encodeURIComponent(email)}`;
    console.log('Buscando configurações:', url);
    
    const headers = await getHeaders();
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    console.log('Resposta do GET /user/settings:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token inválido ou expirado. Faça login novamente.');
      }
      throw new Error(data.message || 'Erro ao carregar configurações');
    }
    
    return data;
  } catch (error) {
    console.error('Erro em getNotificationSettings:', error);
    throw error;
  }
};

export const saveNotificationSettings = async (email, settings) => {
  try {
    const payload = settings;
    console.log('Salvando configurações:', payload);
    
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/user/settings/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Resposta do PUT /user/settings:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token inválido ou expirado. Faça login novamente.');
      }
      throw new Error(data.message || 'Erro ao salvar configurações');
    }
    
    return data;
  } catch (error) {
    console.error('Erro em saveNotificationSettings:', error);
    throw error;
  }
};

export const getCompanyData = async () => {
  try {
    const API_WHITE_LABEL_URL = process.env.PUBLIC_API_URL_WHITE_LABEL;
    if (!API_WHITE_LABEL_URL) {
      throw new Error('PUBLIC_API_URL_WHITE_LABEL não está definido no arquivo .env');
    }

    const response = await fetch(API_WHITE_LABEL_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer paguex',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar dados da empresa');
    }

    return data.company;
  } catch (error) {
    console.error('Erro em getCompanyData:', error);
    throw error;
  }
};
