import React, { useState, useEffect } from 'react';
import { getUnidadesMedida } from '../../services/unidades_medida';
import BaseSingleSelect from './BaseSingleSelect';

const SelectUnidadMedida = ({ value, onChange, label = "Unidad de Medida", required = false, disabled = false }) => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const result = await getUnidadesMedida();
        if (result.success) {
          setUnidades(result.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUnidades();
  }, []);

  return (
    <BaseSingleSelect
        label={label}
        value={value}
        onChange={onChange}
        options={unidades}
        loading={loading}
        placeholder="Seleccione unidad..."
        required={required}
        disabled={disabled}
        valueKey="id"
    />
  );
};

export default SelectUnidadMedida;
