import React, { useState, useEffect } from 'react';
import { Page, Minute } from './types';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import MinutesForm from './pages/MinutesForm';
import MinutesDetail from './pages/MinutesDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';
// 1. IMPORT HALAMAN BARU (Pastikan file ini sudah Anda buat di folder pages)
import UserManagement from './pages/UserManagement'; 
import Schedules from './pages/Schedules';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [selectedMinute, setSelectedMinute] = useState<Minute | null>(null);
    const [editData, setEditData] = useState<Minute | null>(null);

    const navigateTo = (page: Page, data?: any) => {
        if (page === 'detail' && data) {
            setSelectedMinute(data);
        }
        if (page === 'form') {
            setEditData(data || null);
        }
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        setCurrentPage('login');
    };

    if (!isAuthenticated) {
        if (currentPage === 'register') {
            return <Register onNavigate={navigateTo} onRegisterSuccess={handleLogin} />;
        }
        return <Login onLogin={handleLogin} onNavigate={navigateTo} />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard onNavigate={navigateTo} />;
            case 'history':
                return <History onNavigate={navigateTo} />;
            case 'form':
                return <MinutesForm onNavigate={navigateTo} initialData={editData} />;
            case 'detail':
                return selectedMinute ? (
                    <MinutesDetail minute={selectedMinute} onNavigate={navigateTo} />
                ) : (
                    <Dashboard onNavigate={navigateTo} />
                );
            case 'reports':
                return <Reports onNavigate={navigateTo} />;
            case 'profile':
                return <Profile onNavigate={navigateTo} onLogout={handleLogout} />;
            
            // 2. TAMBAHKAN CASE UNTUK HALAMAN MANAJEMEN USER DAN JADWAL
            case 'users':
                return <UserManagement onNavigate={navigateTo} />;
            case 'schedules':
                return <Schedules onNavigate={navigateTo} />;
                
            default:
                return <Dashboard onNavigate={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex flex-col md:flex-row">
            <div className="hidden md:block">
                <Sidebar activePage={currentPage} onNavigate={navigateTo} onLogout={handleLogout} />
            </div>

            <main className="flex-1 overflow-y-auto pb-24 md:pb-0 md:ml-64 lg:ml-72">
                <div className="max-w-7xl mx-auto min-h-screen bg-white md:bg-transparent md:p-8">
                    <div className="md:bg-white md:rounded-3xl md:shadow-xl md:min-h-[calc(100vh-64px)] overflow-hidden border border-slate-100">
                        {renderPage()}
                    </div>
                </div>
            </main>

            <div className="md:hidden">
                <Navbar activePage={currentPage} onNavigate={navigateTo} />
            </div>
        </div>
    );
};

export default App;
