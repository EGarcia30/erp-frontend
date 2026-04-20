import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene la lista completa de clientes
 */
export const getClientes = async () => {
  try {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw error;
  }
};

/**
 * Obtiene un cliente por su ID
 */
export const getClienteById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cliente ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo cliente
 */
export const createCliente = async (clienteData) => {
  try {
    const response = await axios.post(`${API_URL}/clientes`, clienteData);
    return response.data;
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw error;
  }
};

/**
 * Actualiza un cliente existente
 */
export const updateCliente = async (id, clienteData) => {
  try {
    const response = await axios.put(`${API_URL}/clientes/${id}`, clienteData);
    return response.data;
  } catch (error) {
    console.error(`Error updating cliente ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina (desactiva) un cliente
 */
export const deleteCliente = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting cliente ${id}:`, error);
    throw error;
  }
};

/**
 * Activa o desactiva un cliente
 */
export const toggleClienteActivo = async (id, activo) => {
  try {
    const response = await axios.patch(`${API_URL}/clientes/${id}/toggle`, { activo });
    return response.data;
  } catch (error) {
    console.error(`Error toggling cliente ${id}:`, error);
    throw error;
  }
};
