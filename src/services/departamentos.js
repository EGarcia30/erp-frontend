/**
 * HU7663 ERP SV - Servicio de Departamentos (CAT-012)
 * Ministerio de Hacienda - El Salvador
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getDepartamentos = async () => {
  const response = await axios.get(`${API_URL}/departamentos`);
  return response.data;
};

export const getDepartamento = async (codigo) => {
  const response = await axios.get(`${API_URL}/departamentos/${codigo}`);
  return response.data;
};
