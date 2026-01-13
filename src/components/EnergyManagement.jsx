import { useState, useEffect } from 'react';
import { energyService } from '../services/energyService';

function EnergyManagement() {
    const [pompes, setPompes] = useState([]);
    const [consommations, setConsommations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPompeModal, setShowPompeModal] = useState(false);
    const [showConsommationModal, setShowConsommationModal] = useState(false);
    const [editingPompe, setEditingPompe] = useState(null);
    const [message, setMessage] = useState(null);

    const [pompeForm, setPompeForm] = useState({
        reference: '',
        puissance: '',
        statut: 'ACTIVE',
        dateMiseEnService: ''
    });

    const [consommationForm, setConsommationForm] = useState({
        pompeId: '',
        energieUtilisee: '',
        duree: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pompesRes, consommationsRes] = await Promise.all([
                energyService.getAllPompes().catch(() => ({ data: [] })),
                energyService.getAllConsommations().catch(() => ({ data: [] }))
            ]);
            setPompes(pompesRes.data || []);
            setConsommations(consommationsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePompeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPompe) {
                await energyService.updatePompe(editingPompe.id, pompeForm);
                showMessage('Pompe mise à jour avec succès', 'success');
            } else {
                await energyService.createPompe(pompeForm);
                showMessage('Pompe créée avec succès', 'success');
            }
            setShowPompeModal(false);
            resetPompeForm();
            loadData();
        } catch (error) {
            showMessage('Erreur lors de la sauvegarde', 'error');
        }
    };

    const handleConsommationSubmit = async (e) => {
        e.preventDefault();
        try {
            await energyService.createConsommation({
                ...consommationForm,
                dateMesure: new Date().toISOString()
            });
            showMessage('Consommation enregistrée', 'success');
            setShowConsommationModal(false);
            setConsommationForm({ pompeId: '', energieUtilisee: '', duree: '' });
            loadData();
        } catch (error) {
            showMessage('Erreur lors de l\'enregistrement', 'error');
        }
    };

    const handleDeletePompe = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pompe ?')) {
            try {
                await energyService.deletePompe(id);
                showMessage('Pompe supprimée', 'success');
                loadData();
            } catch (error) {
                showMessage('Erreur lors de la suppression', 'error');
            }
        }
    };

    const handleEditPompe = (pompe) => {
        setEditingPompe(pompe);
        setPompeForm({
            reference: pompe.reference,
            puissance: pompe.puissance,
            statut: pompe.statut,
            dateMiseEnService: pompe.dateMiseEnService || ''
        });
        setShowPompeModal(true);
    };

    const resetPompeForm = () => {
        setEditingPompe(null);
        setPompeForm({
            reference: '',
            puissance: '',
            statut: 'ACTIVE',
            dateMiseEnService: ''
        });
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const getTotalConsommationByPompe = (pompeId) => {
        return consommations
            .filter(c => c.pompeId === pompeId)
            .reduce((sum, c) => sum + (c.energieUtilisee || 0), 0);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="header">
                <h1 className="page-title">⚡ Gestion Énergie</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowConsommationModal(true)}>
                        + Consommation
                    </button>
                    <button className="btn btn-primary" onClick={() => { resetPompeForm(); setShowPompeModal(true); }}>
                        + Nouvelle Pompe
                    </button>
                </div>
            </div>

            {message && (
                <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                    {message.text}
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card energy">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Total Pompes</div>
                            <div className="stat-value">{pompes.length}</div>
                        </div>
                        <div className="stat-icon energy">⚡</div>
                    </div>
                </div>
                <div className="stat-card energy">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Pompes Actives</div>
                            <div className="stat-value">{pompes.filter(p => p.statut === 'ACTIVE').length}</div>
                        </div>
                        <div className="stat-icon energy">✅</div>
                    </div>
                </div>
                <div className="stat-card energy">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Énergie Totale</div>
                            <div className="stat-value">{consommations.reduce((s, c) => s + (c.energieUtilisee || 0), 0).toFixed(1)} kWh</div>
                        </div>
                        <div className="stat-icon energy">🔋</div>
                    </div>
                </div>
            </div>

            {/* Pumps Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Liste des Pompes</h3>
                </div>
                {pompes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⚡</div>
                        <p>Aucune pompe enregistrée</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Puissance</th>
                                    <th>Statut</th>
                                    <th>Mise en Service</th>
                                    <th>Consommation Totale</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pompes.map(pompe => (
                                    <tr key={pompe.id}>
                                        <td><strong>{pompe.reference}</strong></td>
                                        <td>{pompe.puissance} W</td>
                                        <td>
                                            <span className={`status-badge ${pompe.statut === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                                <span className="status-dot"></span>
                                                {pompe.statut}
                                            </span>
                                        </td>
                                        <td>{pompe.dateMiseEnService || 'N/A'}</td>
                                        <td>{getTotalConsommationByPompe(pompe.id).toFixed(1)} kWh</td>
                                        <td className="actions-cell">
                                            <button className="btn btn-primary btn-icon" onClick={() => handleEditPompe(pompe)}>✏️</button>
                                            <button className="btn btn-danger btn-icon" onClick={() => handleDeletePompe(pompe.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Consommations Table */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                    <h3 className="card-title">Historique des Consommations</h3>
                </div>
                {consommations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <p>Aucune consommation enregistrée</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Pompe</th>
                                    <th>Énergie</th>
                                    <th>Durée</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consommations.slice(-10).reverse().map(cons => (
                                    <tr key={cons.id}>
                                        <td>#{cons.id}</td>
                                        <td>Pompe {cons.pompeId}</td>
                                        <td><strong>{cons.energieUtilisee} kWh</strong></td>
                                        <td>{cons.duree}h</td>
                                        <td>{new Date(cons.dateMesure).toLocaleString('fr-FR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pompe Modal */}
            {showPompeModal && (
                <div className="modal-overlay" onClick={() => setShowPompeModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingPompe ? 'Modifier la Pompe' : 'Nouvelle Pompe'}</h2>
                            <button className="modal-close" onClick={() => setShowPompeModal(false)}>×</button>
                        </div>
                        <form onSubmit={handlePompeSubmit}>
                            <div className="form-group">
                                <label className="form-label">Référence</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={pompeForm.reference}
                                    onChange={e => setPompeForm({ ...pompeForm, reference: e.target.value })}
                                    required
                                    placeholder="POMPE-001"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Puissance (W)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={pompeForm.puissance}
                                    onChange={e => setPompeForm({ ...pompeForm, puissance: e.target.value })}
                                    required
                                    placeholder="1500"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Statut</label>
                                <select
                                    className="form-input"
                                    value={pompeForm.statut}
                                    onChange={e => setPompeForm({ ...pompeForm, statut: e.target.value })}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date de Mise en Service</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={pompeForm.dateMiseEnService}
                                    onChange={e => setPompeForm({ ...pompeForm, dateMiseEnService: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPompeModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingPompe ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Consommation Modal */}
            {showConsommationModal && (
                <div className="modal-overlay" onClick={() => setShowConsommationModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Ajouter une Consommation</h2>
                            <button className="modal-close" onClick={() => setShowConsommationModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleConsommationSubmit}>
                            <div className="form-group">
                                <label className="form-label">Pompe</label>
                                <select
                                    className="form-input"
                                    value={consommationForm.pompeId}
                                    onChange={e => setConsommationForm({ ...consommationForm, pompeId: e.target.value })}
                                    required
                                >
                                    <option value="">Sélectionner une pompe</option>
                                    {pompes.map(p => (
                                        <option key={p.id} value={p.id}>{p.reference}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Énergie Utilisée (kWh)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-input"
                                    value={consommationForm.energieUtilisee}
                                    onChange={e => setConsommationForm({ ...consommationForm, energieUtilisee: e.target.value })}
                                    required
                                    placeholder="150.5"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Durée (heures)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-input"
                                    value={consommationForm.duree}
                                    onChange={e => setConsommationForm({ ...consommationForm, duree: e.target.value })}
                                    required
                                    placeholder="2.5"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowConsommationModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnergyManagement;
