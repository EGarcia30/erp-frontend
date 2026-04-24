const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getTipoItem = async () => {
    try {
        const response = await fetch(`${apiURL}/tipo-item`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener tipos de ítem:', error);
        return { success: false, error };
    }
};
