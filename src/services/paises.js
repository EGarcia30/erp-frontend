import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene la lista completa de países (CAT-020)
 */
export const getPaises = async () => {
  try {
    const response = await axios.get(`${API_URL}/paises`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paises:', error);
    throw error;
  }
};

/**
 * Obtiene un país por su código
 * @param {string} codigo - Código de 2 letras
 */
export const getPaisByCodigo = async (codigo) => {
  try {
    const response = await axios.get(`${API_URL}/paises/${codigo}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching pais ${codigo}:`, error);
    throw error;
  }
};
