const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * HU7665 ERP SV - Servicio para Unidades de Medida (CAT-014)
 */
export const getUnidadesMedida = async () => {
    try {
        const response = await fetch(`${apiURL}/unidades-medida`);
        if (!response.ok) throw new Error('Error al cargar unidades de medida');
        return await response.json();
    } catch (error) {
        console.error('Service Error:', error);
        return { success: false, data: [] };
    }
};
