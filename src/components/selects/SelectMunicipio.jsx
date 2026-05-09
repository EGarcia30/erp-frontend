import React from 'react';
import { useMunicipios } from '../../hooks/useMunicipios';
import BaseSingleSelect from './BaseSingleSelect';

const SelectMunicipio = ({
  value,
  onChange,
  departamentoCod,
  label = "Distrito",
  required = false,
  disabled = false
}) => {
  const { municipios, loading } = useMunicipios(departamentoCod);

  const isDisabled = disabled || (!departamentoCod && !loading);

  return (
    <BaseSingleSelect
        label={label}
        value={value}
        onChange={onChange}
        options={municipios}
        loading={loading}
        placeholder={!departamentoCod ? "Primero elija depto..." : "Seleccione distrito..."}
        required={required}
        disabled={isDisabled}
        valueKey="codigo"
    />
  );
};

export default SelectMunicipio;
