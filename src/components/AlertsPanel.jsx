import { useState, useEffect } from 'react';
import { waterService } from '../services/waterService';

function AlertsPanel() {
    const [alertes, setAlertes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadAlertes();
        // Auto-refresh every 10 seconds
        const interval = setInterval(loadAlertes, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadAlertes = async () => {
        try {
            const response = await waterService.getAllAlertes().catch(() => ({ data: [] }));
            setAlertes(response.data || []);
        } catch (error) {
            console.error('Error loading alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarquerTraitee = async (id) => {
        try {
            await waterService.marquerAlerteTraitee(id);
            showMessage('Alerte marquée comme traitée', 'success');
            loadAlertes();
        } catch (error) {
            showMessage('Erreur lors de la mise à jour', 'error');
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const filteredAlertes = filter === 'all'
        ? alertes
        : filter === 'pending'
            ? alertes.filter(a => !a.traitee)
            : alertes.filter(a => a.traitee);

    const pendingCount = alertes.filter(a => !a.traitee).length;

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement des alertes...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="header">
                <h1 className="page-title">🔔 Alertes</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        Toutes ({alertes.length})
                    </button>
                    <button
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('pending')}
                    >
                        Non traitées ({pendingCount})
                    </button>
                    <button
                        className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('resolved')}
                    >
                        Traitées ({alertes.length - pendingCount})
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
                <div className="stat-card warning">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Total Alertes</div>
                            <div className="stat-value">{alertes.length}</div>
                        </div>
                        <div className="stat-icon warning">🔔</div>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Non Traitées</div>
                            <div className="stat-value">{pendingCount}</div>
                        </div>
                        <div className="stat-icon warning">⚠️</div>
                    </div>
                </div>
                <div className="stat-card water">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Traitées</div>
                            <div className="stat-value">{alertes.length - pendingCount}</div>
                        </div>
                        <div className="stat-icon water">✅</div>
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        {filter === 'all' ? 'Toutes les alertes' :
                            filter === 'pending' ? 'Alertes non traitées' : 'Alertes traitées'}
                    </h3>
                </div>

                {filteredAlertes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎉</div>
                        <p>
                            {filter === 'pending'
                                ? 'Aucune alerte en attente'
                                : 'Aucune alerte enregistrée'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filteredAlertes.map(alerte => (
                            <div
                                key={alerte.id}
                                className="alert-item"
                                style={{
                                    borderLeftColor: alerte.traitee ? 'var(--secondary)' : 'var(--warning)',
                                    opacity: alerte.traitee ? 0.7 : 1
                                }}
                            >
                                <div
                                    className="alert-icon"
                                    style={{
                                        background: alerte.traitee
                                            ? 'rgba(34, 197, 94, 0.2)'
                                            : 'rgba(245, 158, 11, 0.2)'
                                    }}
                                >
                                    {alerte.traitee ? '✅' : '⚠️'}
                                </div>
                                <div className="alert-content">
                                    <div className="alert-title">
                                        {alerte.type} - Pompe {alerte.pompeId}
                                        {alerte.traitee && (
                                            <span className="status-badge active" style={{ marginLeft: '0.5rem' }}>
                                                Traitée
                                            </span>
                                        )}
                                    </div>
                                    <div className="alert-message">{alerte.message}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <div className="alert-time">
                                            📅 {new Date(alerte.dateAlerte).toLocaleString('fr-FR')}
                                        </div>
                                        {alerte.valeur && (
                                            <div style={{ color: 'var(--warning)', fontWeight: 600 }}>
                                                ⚡ {alerte.valeur.toFixed(1)} kWh
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!alerte.traitee && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleMarquerTraitee(alerte.id)}
                                        style={{ flexShrink: 0 }}
                                    >
                                        ✓ Traiter
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                <h3 className="card-title">ℹ️ À propos des alertes</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Les alertes de surconsommation sont générées automatiquement par le service Énergie
                    lorsqu'une pompe dépasse le seuil de consommation configuré (2000 kWh).
                    Ces alertes sont transmises en temps réel via RabbitMQ et permettent une
                    surveillance proactive du système d'irrigation.
                </p>
            </div>
        </div>
    );
}

export default AlertsPanel;
