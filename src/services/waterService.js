import axios from 'axios';

const API_BASE = '/water-service/api';

export const waterService = {
    // Reservoirs
    getAllReservoirs: () => axios.get(`${API_BASE}/reservoirs`),
    getReservoirById: (id) => axios.get(`${API_BASE}/reservoirs/${id}`),
    createReservoir: (data) => axios.post(`${API_BASE}/reservoirs`, data),
    updateReservoir: (id, data) => axios.put(`${API_BASE}/reservoirs/${id}`, data),
    deleteReservoir: (id) => axios.delete(`${API_BASE}/reservoirs/${id}`),
    getNiveauRemplissage: (id) => axios.get(`${API_BASE}/reservoirs/${id}/niveau`),

    // Debits
    getAllDebits: () => axios.get(`${API_BASE}/debits`),
    getDebitsByPompe: (pompeId) => axios.get(`${API_BASE}/debits/pompe/${pompeId}`),
    createDebit: (data) => axios.post(`${API_BASE}/debits`, data),
    getAverageDebit: (pompeId) => axios.get(`${API_BASE}/debits/pompe/${pompeId}/moyenne`),

    // Alertes
    getAllAlertes: () => axios.get(`${API_BASE}/alertes`),
    getAlertesNonTraitees: () => axios.get(`${API_BASE}/alertes/non-traitees`),
    marquerAlerteTraitee: (id) => axios.put(`${API_BASE}/alertes/${id}/traiter`),

    // Water-Energy Integration
    demarrerPompe: (pompeId) => axios.post(`${API_BASE}/water/demarrer-pompe/${pompeId}`),
};
