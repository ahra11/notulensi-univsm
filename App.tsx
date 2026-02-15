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
import UserManagement from './pages/UserManagement'; 
import Schedules from './pages/Schedules';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    
    // State untuk data user yang sedang login
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [selectedMinute, setSelectedMinute] = useState<Minute | null>(null);
    const [editData, setEditData] = useState<Minute | null>(null);

    useEffect(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            setCurrentUser(JSON.parse(userJson));
        }
    }, [isAuthenticated]);

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
        setCurrentUser(null);
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
            
            // PROTEKSI HALAMAN USER MANAGEMENT
            case 'users':
                if (currentUser?.role === 'SUPER_ADMIN') {
                    return <UserManagement onNavigate={navigateTo} />;
                }
                // Jika bukan Super Admin (Pimpinan/Staf/Sekretaris), lempar balik ke Dashboard
                return <Dashboard onNavigate={navigateTo} />;
            
            case 'schedules':
                return <Schedules onNavigate={navigateTo} />;
                
            default:
                return <Dashboard onNavigate={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex flex-col md:flex-row">
            {/* Sidebar otomatis menyaring menu berdasarkan role yang login */}
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
