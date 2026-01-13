import { useState, useEffect } from 'react';
import { waterService } from '../services/waterService';

function WaterManagement() {
    const [reservoirs, setReservoirs] = useState([]);
    const [debits, setDebits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReservoirModal, setShowReservoirModal] = useState(false);
    const [showDebitModal, setShowDebitModal] = useState(false);
    const [editingReservoir, setEditingReservoir] = useState(null);
    const [message, setMessage] = useState(null);

    const [reservoirForm, setReservoirForm] = useState({
        nom: '',
        capaciteTotale: '',
        volumeActuel: '',
        localisation: ''
    });

    const [debitForm, setDebitForm] = useState({
        pompeId: '',
        debit: '',
        unite: 'L/min'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [reservoirsRes, debitsRes] = await Promise.all([
                waterService.getAllReservoirs().catch(() => ({ data: [] })),
                waterService.getAllDebits().catch(() => ({ data: [] }))
            ]);
            setReservoirs(reservoirsRes.data || []);
            setDebits(debitsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReservoirSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingReservoir) {
                await waterService.updateReservoir(editingReservoir.id, reservoirForm);
                showMessage('Réservoir mis à jour avec succès', 'success');
            } else {
                await waterService.createReservoir(reservoirForm);
                showMessage('Réservoir créé avec succès', 'success');
            }
            setShowReservoirModal(false);
            resetReservoirForm();
            loadData();
        } catch (error) {
            showMessage('Erreur lors de la sauvegarde', 'error');
        }
    };

    const handleDebitSubmit = async (e) => {
        e.preventDefault();
        try {
            await waterService.createDebit({
                ...debitForm,
                dateMesure: new Date().toISOString()
            });
            showMessage('Débit enregistré', 'success');
            setShowDebitModal(false);
            setDebitForm({ pompeId: '', debit: '', unite: 'L/min' });
            loadData();
        } catch (error) {
            showMessage('Erreur lors de l\'enregistrement', 'error');
        }
    };

    const handleDeleteReservoir = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce réservoir ?')) {
            try {
                await waterService.deleteReservoir(id);
                showMessage('Réservoir supprimé', 'success');
                loadData();
            } catch (error) {
                showMessage('Erreur lors de la suppression', 'error');
            }
        }
    };

    const handleEditReservoir = (reservoir) => {
        setEditingReservoir(reservoir);
        setReservoirForm({
            nom: reservoir.nom,
            capaciteTotale: reservoir.capaciteTotale,
            volumeActuel: reservoir.volumeActuel,
            localisation: reservoir.localisation
        });
        setShowReservoirModal(true);
    };

    const handleStartPump = async (pompeId) => {
        try {
            const response = await waterService.demarrerPompe(pompeId);
            if (response.data.success) {
                showMessage(response.data.message, 'success');
            } else {
                showMessage(response.data.message, 'error');
            }
        } catch (error) {
            showMessage('Erreur de communication avec le service énergie', 'error');
        }
    };

    const resetReservoirForm = () => {
        setEditingReservoir(null);
        setReservoirForm({
            nom: '',
            capaciteTotale: '',
            volumeActuel: '',
            localisation: ''
        });
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const totalCapacity = reservoirs.reduce((sum, r) => sum + (r.capaciteTotale || 0), 0);
    const totalVolume = reservoirs.reduce((sum, r) => sum + (r.volumeActuel || 0), 0);

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
                <h1 className="page-title">💧 Gestion Eau</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setShowDebitModal(true)}>
                        + Débit
                    </button>
                    <button className="btn btn-primary" onClick={() => { resetReservoirForm(); setShowReservoirModal(true); }}>
                        + Nouveau Réservoir
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
                <div className="stat-card water">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Total Réservoirs</div>
                            <div className="stat-value">{reservoirs.length}</div>
                        </div>
                        <div className="stat-icon water">💧</div>
                    </div>
                </div>
                <div className="stat-card water">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Capacité Totale</div>
                            <div className="stat-value">{totalCapacity.toLocaleString()} L</div>
                        </div>
                        <div className="stat-icon water">🏊</div>
                    </div>
                </div>
                <div className="stat-card water">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Volume Disponible</div>
                            <div className="stat-value">{totalVolume.toLocaleString()} L</div>
                        </div>
                        <div className="stat-icon water">📊</div>
                    </div>
                </div>
                <div className="stat-card water">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Taux de Remplissage</div>
                            <div className="stat-value">{totalCapacity > 0 ? ((totalVolume / totalCapacity) * 100).toFixed(1) : 0}%</div>
                        </div>
                        <div className="stat-icon water">📈</div>
                    </div>
                </div>
            </div>

            {/* Reservoirs Grid */}
            <h2 className="section-title">
                <span className="section-icon">🏊</span>
                Réservoirs
            </h2>
            {reservoirs.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">💧</div>
                        <p>Aucun réservoir enregistré</p>
                    </div>
                </div>
            ) : (
                <div className="cards-grid">
                    {reservoirs.map(reservoir => {
                        const level = reservoir.capaciteTotale > 0
                            ? (reservoir.volumeActuel / reservoir.capaciteTotale) * 100
                            : 0;
                        return (
                            <div key={reservoir.id} className="card reservoir-card">
                                <div className="card-header">
                                    <div>
                                        <h3 className="card-title">{reservoir.nom}</h3>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            📍 {reservoir.localisation}
                                        </div>
                                    </div>
                                    <div className="actions-cell">
                                        <button className="btn btn-primary btn-icon" onClick={() => handleEditReservoir(reservoir)}>✏️</button>
                                        <button className="btn btn-danger btn-icon" onClick={() => handleDeleteReservoir(reservoir.id)}>🗑️</button>
                                    </div>
                                </div>
                                <div className="reservoir-level">
                                    <div className="reservoir-water" style={{ height: `${level}%` }}>
                                        <span className="reservoir-percentage">{level.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Volume Actuel</div>
                                        <div style={{ fontWeight: 600 }}>{(reservoir.volumeActuel || 0).toLocaleString()} L</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Capacité</div>
                                        <div style={{ fontWeight: 600 }}>{(reservoir.capaciteTotale || 0).toLocaleString()} L</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Debits Table */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h3 className="card-title">📊 Mesures de Débit</h3>
                </div>
                {debits.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <p>Aucune mesure de débit enregistrée</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Pompe</th>
                                    <th>Débit</th>
                                    <th>Unité</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {debits.slice(-10).reverse().map(debit => (
                                    <tr key={debit.id}>
                                        <td>#{debit.id}</td>
                                        <td>Pompe {debit.pompeId}</td>
                                        <td><strong>{debit.debit}</strong></td>
                                        <td>{debit.unite}</td>
                                        <td>{new Date(debit.dateMesure).toLocaleString('fr-FR')}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                onClick={() => handleStartPump(debit.pompeId)}
                                            >
                                                🚀 Démarrer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reservoir Modal */}
            {showReservoirModal && (
                <div className="modal-overlay" onClick={() => setShowReservoirModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingReservoir ? 'Modifier le Réservoir' : 'Nouveau Réservoir'}</h2>
                            <button className="modal-close" onClick={() => setShowReservoirModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleReservoirSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={reservoirForm.nom}
                                    onChange={e => setReservoirForm({ ...reservoirForm, nom: e.target.value })}
                                    required
                                    placeholder="Réservoir Principal"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Capacité Totale (L)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={reservoirForm.capaciteTotale}
                                    onChange={e => setReservoirForm({ ...reservoirForm, capaciteTotale: e.target.value })}
                                    required
                                    placeholder="10000"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Volume Actuel (L)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={reservoirForm.volumeActuel}
                                    onChange={e => setReservoirForm({ ...reservoirForm, volumeActuel: e.target.value })}
                                    required
                                    placeholder="7500"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Localisation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={reservoirForm.localisation}
                                    onChange={e => setReservoirForm({ ...reservoirForm, localisation: e.target.value })}
                                    required
                                    placeholder="Zone A"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowReservoirModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingReservoir ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Debit Modal */}
            {showDebitModal && (
                <div className="modal-overlay" onClick={() => setShowDebitModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Ajouter une Mesure de Débit</h2>
                            <button className="modal-close" onClick={() => setShowDebitModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleDebitSubmit}>
                            <div className="form-group">
                                <label className="form-label">ID Pompe</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={debitForm.pompeId}
                                    onChange={e => setDebitForm({ ...debitForm, pompeId: e.target.value })}
                                    required
                                    placeholder="1"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Débit</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-input"
                                    value={debitForm.debit}
                                    onChange={e => setDebitForm({ ...debitForm, debit: e.target.value })}
                                    required
                                    placeholder="150.5"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Unité</label>
                                <select
                                    className="form-input"
                                    value={debitForm.unite}
                                    onChange={e => setDebitForm({ ...debitForm, unite: e.target.value })}
                                >
                                    <option value="L/min">L/min</option>
                                    <option value="L/h">L/h</option>
                                    <option value="m³/h">m³/h</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDebitModal(false)}>
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

export default WaterManagement;
