import React, { useState, useEffect } from 'react';
import { getTiposPersona } from '../../services/tipo_persona';
import BaseSingleSelect from './BaseSingleSelect';

const SelectTipoPersona = ({ value, onChange, label = "Tipo de Persona", required = false, disabled = false }) => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await getTiposPersona();
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
        placeholder="Seleccione tipo..."
        required={required}
        disabled={disabled}
        valueKey="codigo"
    />
  );
};

export default SelectTipoPersona;
