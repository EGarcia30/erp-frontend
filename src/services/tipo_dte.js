import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene la lista de tipos de DTE (CAT-002) desde la base de datos
 */
export const getTiposDTE = async () => {
  try {
    const response = await axios.get(`${API_URL}/tipo-dte`);
    return response.data.success ? response.data.data : response.data;
  } catch (error) {
    console.error('Error fetching tipos DTE:', error);
    throw error;
  }
};
