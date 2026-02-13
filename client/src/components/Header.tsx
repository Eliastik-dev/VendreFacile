import { Link } from 'react-router-dom';
import { Search, User, LogOut, Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">VendreFacile</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                <Link to="/create-ad" className="btn-primary flex items-center space-x-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Publier une annonce</span>
                                </Link>
                                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                                    Mes annonces
                                </Link>
                                <Link to="/messages" className="text-gray-700 hover:text-primary-600 transition-colors">
                                    Messages
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <div className="text-sm text-gray-700">
                                        {user?.email}
                                    </div>
                                    <button onClick={logout} className="btn-secondary flex items-center space-x-2">
                                        <LogOut className="w-4 h-4" />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-outline">
                                    Connexion
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Inscription
                                </Link>
                            </>
                        )}
                    </nav>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col space-y-3">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/create-ad" className="btn-primary text-center">Publier une annonce</Link>
                                    <Link to="/dashboard" className="text-gray-700 py-2">Mes annonces</Link>
                                    <Link to="/messages" className="text-gray-700 py-2">Messages</Link>
                                    <button onClick={logout} className="btn-secondary justify-center">Déconnexion</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-outline text-center">Connexion</Link>
                                    <Link to="/register" className="btn-primary text-center">Inscription</Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
