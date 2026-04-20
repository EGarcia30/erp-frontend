import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene la lista de tipos de documento (CAT-022)
 */
export const getTiposDocumento = async () => {
  try {
    const response = await axios.get(`${API_URL}/tipo-documento`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tipos documento:', error);
    throw error;
  }
};
