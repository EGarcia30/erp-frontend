import React, { useState, useEffect } from 'react';
import BaseSingleSelect from './BaseSingleSelect';

const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SelectTipoImpuesto = (props) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchImpuestos = async () => {
            try {
                const response = await fetch(`${apiURL}/tipo-impuesto`);
                const data = await response.json();
                if (data.success) {
                    setOptions(data.data.map(item => ({
                        codigo: item.codigo, 
                        nombre: item.nombre
                    })));
                }
            } catch (err) {
                console.error('Error cargando tipos de impuesto:', err);
            }
        };
        fetchImpuestos();
    }, []);

    // Si el valor viene vacío, forzar '1' (Gravado)
    const finalValue = props.value || '1';

    return (
        <BaseSingleSelect 
            {...props} 
            value={finalValue}
            options={options} 
            valueKey="codigo" 
            labelKey="nombre"
            showCode={false}
        />
    );
};

export default SelectTipoImpuesto;
