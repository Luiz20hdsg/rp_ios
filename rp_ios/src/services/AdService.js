const AD_API_URL = 'https://mdjwnstt36.execute-api.us-east-1.amazonaws.com/Prod/advertisement/current';

/**
 * Fetches the current active advertisement from the API.
 * @returns {Promise<object|null>} A promise that resolves to the ad data object, or null if no ad is active or an error occurs.
 */
const fetchCurrentAd = async () => {
  try {
    const response = await fetch(AD_API_URL);

    if (response.status === 404) {
      console.log("Nenhum anúncio ativo encontrado (404).");
      return null;
    }

    if (!response.ok) {
      throw new Error(`Erro na API de anúncios: ${response.statusText} (status: ${response.status})`);
    }

    const adData = await response.json();
    console.log("Dados do anúncio recebidos:", adData);
    return adData;

  } catch (error) {
    console.error("Falha ao buscar anúncio:", error);
    return null;
  }
};

export const adService = {
  hasBeenShown: false,
  fetchCurrentAd,
};