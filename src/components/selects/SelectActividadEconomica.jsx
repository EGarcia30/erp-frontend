import React, { useState, useEffect } from 'react';
import { getActividadesEconomicas } from '../../services/actividad_economica';
import BaseSingleSelect from './BaseSingleSelect';

const SelectActividadEconomica = ({ value, onChange, label = "Actividad Económica", required = false, disabled = false }) => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const data = await getActividadesEconomicas();
        setActividades(data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchActividades();
  }, []);

  return (
    <BaseSingleSelect
        label={label}
        value={value}
        onChange={onChange}
        options={actividades}
        loading={loading}
        placeholder="Seleccione actividad..."
        required={required}
        disabled={disabled}
        valueKey="codigo"
    />
  );
};

export default SelectActividadEconomica;
