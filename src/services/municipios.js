/**
 * HU7663 ERP SV - Servicio de Municipios/Distritos (CAT-013)
 * Ministerio de Hacienda - El Salvador
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getMunicipios = async () => {
  const response = await axios.get(`${API_URL}/municipios`);
  return response.data;
};

export const getMunicipiosByDepartamento = async (departamentoCod) => {
  const response = await axios.get(`${API_URL}/municipios/departamento/${departamentoCod}`);
  return response.data;
};

export const getMunicipio = async (codigo, departamentoCod) => {
  const response = await axios.get(`${API_URL}/municipios/${codigo}`, {
    params: { departamento_cod: departamentoCod }
  });
  return response.data;
};
