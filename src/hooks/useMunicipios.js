/**
 * HU7663 ERP SV - Hook para Municipios/Distritos (CAT-013)
 */

import { useState, useEffect, useCallback } from 'react';
import { getMunicipiosByDepartamento } from '../services/municipios';

export const useMunicipios = (departamentoCod = null) => {
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMunicipios = useCallback(async () => {
    if (!departamentoCod) {
      setMunicipios([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getMunicipiosByDepartamento(departamentoCod);
      if (response.success) {
        setMunicipios(response.data);
      }
    } catch (err) {
      setError(err.message || 'Error cargando distritos');
      console.error('useMunicipios error:', err);
    } finally {
      setLoading(false);
    }
  }, [departamentoCod]);

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  const refetch = () => fetchMunicipios();

  return { municipios, loading, error, refetch };
};
