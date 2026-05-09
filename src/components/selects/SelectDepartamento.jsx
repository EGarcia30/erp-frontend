import React from 'react';
import { useDepartamentos } from '../../hooks/useDepartamentos';
import BaseSingleSelect from './BaseSingleSelect';

const SelectDepartamento = ({
  value,
  onChange,
  label = "Departamento",
  required = false,
  disabled = false
}) => {
  const { departamentos, loading } = useDepartamentos();

  return (
    <BaseSingleSelect
        label={label}
        value={value}
        onChange={onChange}
        options={departamentos}
        loading={loading}
        placeholder="Seleccione depto..."
        required={required}
        disabled={disabled}
        valueKey="codigo"
    />
  );
};

export default SelectDepartamento;
