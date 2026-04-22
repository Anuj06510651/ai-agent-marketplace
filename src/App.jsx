import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import Marketplace from './pages/Marketplace';
import SetupWizard from './pages/SetupWizard';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import WebConcierge from './pages/WebConcierge';
import PublicBot from './pages/PublicBot';
import { clearAuthSession, getStoredUser, isAuthenticated } from './utils/auth';

function AppLayout({ children, user, onLogout }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
                <TopNav user={user} onLogout={onLogout} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

function RequireAuth({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}

function AppRoutes() {
    const navigate = useNavigate();
    const [user, setUser] = useState(getStoredUser());

    const handleAuthSuccess = (nextUser) => {
        setUser(nextUser);
        navigate('/', { replace: true });
    };

    const handleLogout = () => {
        clearAuthSession();
        setUser(null);
        navigate('/auth', { replace: true });
    };

    return (
        <Routes>
            <Route
                path="/auth"
                element={isAuthenticated() ? <Navigate to="/" replace /> : <Auth onAuthSuccess={handleAuthSuccess} />}
            />

            <Route
                path="/bot/:slug"
                element={<PublicBot />}
            />

            <Route
                path="/setup"
                element={(
                    <RequireAuth>
                        <SetupWizard />
                    </RequireAuth>
                )}
            />

            <Route
                path="/"
                element={(
                    <RequireAuth>
                        <AppLayout user={user} onLogout={handleLogout}>
                            <Marketplace />
                        </AppLayout>
                    </RequireAuth>
                )}
            />

            <Route
                path="/analytics"
                element={(
                    <RequireAuth>
                        <AppLayout user={user} onLogout={handleLogout}>
                            <Analytics />
                        </AppLayout>
                    </RequireAuth>
                )}
            />

            <Route
                path="/web-concierge"
                element={(
                    <RequireAuth>
                        <AppLayout user={user} onLogout={handleLogout}>
                            <WebConcierge />
                        </AppLayout>
                    </RequireAuth>
                )}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
