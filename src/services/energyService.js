import axios from 'axios';

const API_BASE = '/energy-service/api';

export const energyService = {
    // Pompes
    getAllPompes: () => axios.get(`${API_BASE}/pompes`),
    getPompeById: (id) => axios.get(`${API_BASE}/pompes/${id}`),
    createPompe: (data) => axios.post(`${API_BASE}/pompes`, data),
    updatePompe: (id, data) => axios.put(`${API_BASE}/pompes/${id}`, data),
    deletePompe: (id) => axios.delete(`${API_BASE}/pompes/${id}`),

    // Consommations
    getAllConsommations: () => axios.get(`${API_BASE}/consommations`),
    getConsommationsByPompe: (pompeId) => axios.get(`${API_BASE}/consommations/pompe/${pompeId}`),
    createConsommation: (data) => axios.post(`${API_BASE}/consommations`, data),
    getTotalConsommation: (pompeId) => axios.get(`${API_BASE}/consommations/pompe/${pompeId}/total`),

    // Energy Management
    checkDisponibilite: (pompeId) => axios.get(`${API_BASE}/energy/disponibilite/${pompeId}`),
};
