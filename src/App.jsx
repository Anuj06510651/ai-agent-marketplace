import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import Marketplace from './pages/Marketplace';
import SetupWizard from './pages/SetupWizard';
import Analytics from './pages/Analytics';

function AppLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
                <TopNav />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

function AppRoutes() {
    const location = useLocation();
    const isSetup = location.pathname === '/setup';

    if (isSetup) {
        return <SetupWizard />;
    }

    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<Marketplace />} />
                <Route path="/analytics" element={<Analytics />} />
            </Routes>
        </AppLayout>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/*" element={
                    <AppLayout>
                        <Routes>
                            <Route path="/" element={<Marketplace />} />
                            <Route path="/analytics" element={<Analytics />} />
                        </Routes>
                    </AppLayout>
                } />
            </Routes>
        </BrowserRouter>
    );
}
