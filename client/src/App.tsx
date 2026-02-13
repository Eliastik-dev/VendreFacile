import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import GDPRBanner from './components/GDPRBanner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdDetailsPage from './pages/AdDetailsPage';
import DashboardPage from './pages/DashboardPage';
import MessagingPage from './pages/MessagingPage';

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/ads/:id" element={<AdDetailsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/messages" element={<MessagingPage />} />
                    <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                                <p className="text-xl text-gray-600 mb-6">Page non trouvée</p>
                                <a href="/" className="btn-primary">Retour à l'accueil</a>
                            </div>
                        </div>
                    } />
                </Routes>
            </main>
            <GDPRBanner />
        </div>
    );
}

export default App;
