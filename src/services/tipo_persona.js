import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene la lista de tipos de persona (CAT-029)
 */
export const getTiposPersona = async () => {
  try {
    const response = await axios.get(`${API_URL}/tipo-persona`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tipos persona:', error);
    throw error;
  }
};
