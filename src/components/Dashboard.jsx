import { useState, useEffect } from 'react';
import { energyService } from '../services/energyService';
import { waterService } from '../services/waterService';

function Dashboard() {
    const [stats, setStats] = useState({
        pompes: [],
        reservoirs: [],
        consommations: [],
        alertes: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        // Refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [pompesRes, reservoirsRes, consommationsRes, alertesRes] = await Promise.all([
                energyService.getAllPompes().catch(() => ({ data: [] })),
                waterService.getAllReservoirs().catch(() => ({ data: [] })),
                energyService.getAllConsommations().catch(() => ({ data: [] })),
                waterService.getAlertesNonTraitees().catch(() => ({ data: [] }))
            ]);

            setStats({
                pompes: pompesRes.data || [],
                reservoirs: reservoirsRes.data || [],
                consommations: consommationsRes.data || [],
                alertes: alertesRes.data || []
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const activePumps = stats.pompes.filter(p => p.statut === 'ACTIVE').length;
    const totalEnergy = stats.consommations.reduce((sum, c) => sum + (c.energieUtilisee || 0), 0);
    const avgReservoirLevel = stats.reservoirs.length > 0
        ? stats.reservoirs.reduce((sum, r) => sum + ((r.volumeActuel / r.capaciteTotale) * 100), 0) / stats.reservoirs.length
        : 0;

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p>Chargement des données...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="header">
                <h1 className="page-title">Tableau de Bord</h1>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card energy">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Pompes Actives</div>
                            <div className="stat-value">{activePumps} / {stats.pompes.length}</div>
                        </div>
                        <div className="stat-icon energy">⚡</div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill energy"
                            style={{ width: `${stats.pompes.length > 0 ? (activePumps / stats.pompes.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div className="stat-card water">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Niveau Moyen Réservoirs</div>
                            <div className="stat-value">{avgReservoirLevel.toFixed(1)}%</div>
                        </div>
                        <div className="stat-icon water">💧</div>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill water" style={{ width: `${avgReservoirLevel}%` }} />
                    </div>
                </div>

                <div className="stat-card energy">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Énergie Consommée</div>
                            <div className="stat-value">{totalEnergy.toFixed(1)} kWh</div>
                        </div>
                        <div className="stat-icon energy">🔋</div>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Alertes Non Traitées</div>
                            <div className="stat-value">{stats.alertes.length}</div>
                        </div>
                        <div className="stat-icon warning">⚠️</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="section-title">
                <span className="section-icon">🚀</span>
                Actions Rapides
            </h2>
            <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => window.location.href = '/energy'}>
                    <div className="quick-action-icon">➕</div>
                    <div className="quick-action-title">Ajouter une Pompe</div>
                    <div className="quick-action-desc">Configurer une nouvelle pompe d'irrigation</div>
                </button>
                <button className="quick-action-btn" onClick={() => window.location.href = '/water'}>
                    <div className="quick-action-icon">🏊</div>
                    <div className="quick-action-title">Ajouter un Réservoir</div>
                    <div className="quick-action-desc">Enregistrer un nouveau réservoir d'eau</div>
                </button>
                <button className="quick-action-btn" onClick={() => window.location.href = '/alerts'}>
                    <div className="quick-action-icon">🔔</div>
                    <div className="quick-action-title">Voir les Alertes</div>
                    <div className="quick-action-desc">Consulter et traiter les alertes en cours</div>
                </button>
            </div>

            {/* Two Columns Layout */}
            <div className="two-columns">
                {/* Pumps Section */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">⚡ État des Pompes</h3>
                    </div>
                    {stats.pompes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">⚡</div>
                            <p>Aucune pompe enregistrée</p>
                        </div>
                    ) : (
                        stats.pompes.slice(0, 5).map(pompe => (
                            <div key={pompe.id} className="pump-card">
                                <div className="pump-icon">⚡</div>
                                <div className="pump-info">
                                    <div className="pump-name">{pompe.reference}</div>
                                    <div className="pump-power">{pompe.puissance} W</div>
                                </div>
                                <div className={`status-badge ${pompe.statut === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                    <span className="status-dot"></span>
                                    {pompe.statut}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Reservoirs Section */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">💧 Réservoirs</h3>
                    </div>
                    {stats.reservoirs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">💧</div>
                            <p>Aucun réservoir enregistré</p>
                        </div>
                    ) : (
                        stats.reservoirs.slice(0, 3).map(reservoir => {
                            const level = (reservoir.volumeActuel / reservoir.capaciteTotale) * 100;
                            return (
                                <div key={reservoir.id} className="reservoir-card" style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: 600 }}>{reservoir.nom}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {reservoir.localisation}
                                    </div>
                                    <div className="reservoir-level">
                                        <div className="reservoir-water" style={{ height: `${level}%` }}>
                                            <span className="reservoir-percentage">{level.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Alerts Section */}
            {stats.alertes.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h2 className="section-title">
                        <span className="section-icon">⚠️</span>
                        Alertes Récentes
                    </h2>
                    <div className="card">
                        {stats.alertes.slice(0, 3).map(alerte => (
                            <div key={alerte.id} className="alert-item">
                                <div className="alert-icon">⚠️</div>
                                <div className="alert-content">
                                    <div className="alert-title">Surconsommation - Pompe {alerte.pompeId}</div>
                                    <div className="alert-message">{alerte.message}</div>
                                    <div className="alert-time">
                                        {new Date(alerte.dateAlerte).toLocaleString('fr-FR')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
