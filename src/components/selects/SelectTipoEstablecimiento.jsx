import React, { useState, useEffect } from 'react';
import { getTiposEstablecimiento } from '../../services/empresa';
import BaseSingleSelect from './BaseSingleSelect';

const SelectTipoEstablecimiento = ({ value, onChange, label = "Tipo de Establecimiento", required = false, disabled = false }) => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await getTiposEstablecimiento();
        setTipos(data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchTipos();
  }, []);

  return (
    <BaseSingleSelect
        label={label}
        value={value}
        onChange={onChange}
        options={tipos}
        loading={loading}
        placeholder="Seleccione tipo establecimiento..."
        required={required}
        disabled={disabled}
        valueKey="codigo"
    />
  );
};

export default SelectTipoEstablecimiento;
