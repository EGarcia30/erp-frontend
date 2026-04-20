import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene los datos de configuración de la empresa (ID 1)
 */
export const getEmpresa = async () => {
  try {
    const response = await axios.get(`${API_URL}/empresa`);
    return response.data;
  } catch (error) {
    console.error('Error fetching empresa:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de la empresa
 */
export const updateEmpresa = async (empresaData) => {
  try {
    const response = await axios.put(`${API_URL}/empresa`, empresaData);
    return response.data;
  } catch (error) {
    console.error('Error updating empresa:', error);
    throw error;
  }
};

/**
 * Obtiene los tipos de establecimiento (CAT-009)
 */
export const getTiposEstablecimiento = async () => {
  try {
    const response = await axios.get(`${API_URL}/tipo-establecimiento`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tipos establecimiento:', error);
    throw error;
  }
};
