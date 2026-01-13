import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EnergyManagement from './components/EnergyManagement';
import WaterManagement from './components/WaterManagement';
import AlertsPanel from './components/AlertsPanel';
import './App.css';

function Sidebar() {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/energy', icon: '⚡', label: 'Énergie' },
        { path: '/water', icon: '💧', label: 'Eau' },
        { path: '/alerts', icon: '🔔', label: 'Alertes' }
    ];

    return (
        <aside className="sidebar">
            <div className="logo">
                <div className="logo-icon">🌱</div>
                <span className="logo-text">IrriFlow</span>
            </div>
            <nav className="nav-menu">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

function App() {
    return (
        <Router>
            <div className="app">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/energy" element={<EnergyManagement />} />
                        <Route path="/water" element={<WaterManagement />} />
                        <Route path="/alerts" element={<AlertsPanel />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
