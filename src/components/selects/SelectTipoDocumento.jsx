import React, { useState, useEffect } from 'react';
import { getTiposDocumento } from '../../services/tipo_documento';
import BaseSingleSelect from './BaseSingleSelect';

const SelectTipoDocumento = ({ value, onChange, label = "Tipo Documento", required = false, disabled = false }) => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await getTiposDocumento();
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
        placeholder="Seleccione documento..."
        required={required}
        disabled={disabled}
        valueKey="codigo"
    />
  );
};

export default SelectTipoDocumento;
