/**
 * HU7663 ERP SV - Hook para Departamentos (CAT-012)
 */

import { useState, useEffect } from 'react';
import { getDepartamentos } from '../services/departamentos';

export const useDepartamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getDepartamentos();
        if (response.success) {
          setDepartamentos(response.data);
        }
      } catch (err) {
        setError(err.message || 'Error cargando departamentos');
        console.error('useDepartamentos error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartamentos();
  }, []);

  return { departamentos, loading, error };
};
