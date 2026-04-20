import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene todas las formas de pago activas (CAT-017)
 */
export const getFormasPago = async () => {
  try {
    const response = await axios.get(`${API_URL}/forma_pago`);
    return response.data;
  } catch (error) {
    console.error('Error fetching formas de pago:', error);
    throw error;
  }
};
