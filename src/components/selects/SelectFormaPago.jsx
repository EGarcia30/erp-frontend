import React, { useState, useEffect } from 'react';
import { getFormasPago } from '../../services/forma_pago';
import BaseSingleSelect from './BaseSingleSelect';

const SelectFormaPago = ({
  value,
  onChange,
  label = "Forma de Pago",
  required = false,
  disabled = false
}) => {
  const [formas, setFormas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormas = async () => {
      try {
        const response = await getFormasPago();
        const formasData = response.data || response;
        setFormas(formasData || []);
      } finally {
        setLoading(false);
      }
    };
    fetchFormas();
  }, []);

  return (
    <BaseSingleSelect
        label={label}
        value={value}
        onChange={onChange}
        options={formas}
        loading={loading}
        placeholder="Seleccione forma de pago..."
        required={required}
        disabled={disabled}
    />
  );
};

export default SelectFormaPago;
