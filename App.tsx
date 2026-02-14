
import React, { useState, useEffect } from 'react';
import { Page, Minute } from './types';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import MinutesForm from './pages/MinutesForm';
import MinutesDetail from './pages/MinutesDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [selectedMinute, setSelectedMinute] = useState<Minute | null>(null);

    const navigateTo = (page: Page, data?: any) => {
        if (page === 'detail' && data) {
            setSelectedMinute(data);
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
                return <MinutesForm onNavigate={navigateTo} />;
            case 'detail':
                return selectedMinute ? (
                    <MinutesDetail minute={selectedMinute} onNavigate={navigateTo} />
                ) : (
                    <Dashboard onNavigate={navigateTo} />
                );
            case 'profile':
                return <Profile onNavigate={navigateTo} onLogout={handleLogout} />;
            default:
                return <Dashboard onNavigate={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar activePage={currentPage} onNavigate={navigateTo} onLogout={handleLogout} />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 md:pb-0 md:ml-64 lg:ml-72">
                <div className="max-w-7xl mx-auto min-h-screen bg-white md:bg-transparent md:p-8">
                    <div className="md:bg-white md:rounded-3xl md:shadow-xl md:min-h-[calc(100vh-64px)] overflow-hidden border border-slate-100">
                        {renderPage()}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navbar */}
            <div className="md:hidden">
                <Navbar activePage={currentPage} onNavigate={navigateTo} />
            </div>
        </div>
    );
};

export default App;
