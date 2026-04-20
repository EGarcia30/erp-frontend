import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene la lista completa de actividades económicas (CAT-019)
 */
export const getActividadesEconomicas = async () => {
  try {
    const response = await axios.get(`${API_URL}/actividad-economica`);
    return response.data;
  } catch (error) {
    console.error('Error fetching actividades económicas:', error);
    throw error;
  }
};

/**
 * Obtiene una actividad económica por su código
 * @param {string} codigo - Código de 5 dígitos
 */
export const getActividadEconomicaByCodigo = async (codigo) => {
  try {
    const response = await axios.get(`${API_URL}/actividad-economica/${codigo}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching actividad económica ${codigo}:`, error);
    throw error;
  }
};
