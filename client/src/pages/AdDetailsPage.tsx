import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ArrowLeft, MessageSquare, Heart, AlertCircle } from 'lucide-react';
import { adService, type Ad } from '../services/adService';
import { useAuthStore } from '../stores/useAuthStore';
import Loading from '../components/Loading';

export default function AdDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [ad, setAd] = useState<Ad | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        loadAd();
    }, [id]);

    const loadAd = async () => {
        if (!id) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const data = await adService.getAdById(id);
            setAd(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Annonce introuvable');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContactSeller = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate(`/messages?adId=${id}`);
    };

    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsFavorite(!isFavorite);
    };

    if (isLoading) return <Loading />;

    if (error || !ad) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Annonce introuvable</h2>
                    <p className="text-gray-600 mb-6">{error || 'Cette annonce n\'existe pas ou a été supprimée'}</p>
                    <Link to="/" className="btn-primary">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: ad.price.currency,
    }).format(ad.price.amount);

    const formattedDate = new Date(ad.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Retour</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card overflow-hidden">
                            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                {ad.images && ad.images.length > 0 ? (
                                    <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-primary-600 text-lg font-medium">Aucune image disponible</div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full mb-2">
                                            {ad.category}
                                        </span>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                                        <p className="text-4xl font-bold text-primary-600">{formattedPrice}</p>
                                    </div>
                                    <button
                                        onClick={handleToggleFavorite}
                                        className={`p-3 rounded-full transition-colors ${
                                            isFavorite
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{ad.location.city}, {ad.location.postalCode}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Publié le {formattedDate}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {ad.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Vendeur</h3>
                            
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-bold text-lg">V</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Vendeur</p>
                                    <p className="text-sm text-gray-600">Membre depuis {new Date(ad.createdAt).getFullYear()}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleContactSeller}
                                className="btn-primary w-full flex items-center justify-center space-x-2 mb-3"
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span>Contacter le vendeur</span>
                            </button>

                            {ad.status === 'SOLD' && (
                                <div className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-center font-medium">
                                    Article vendu
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-medium text-gray-900 mb-3">Informations</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Statut:</span>
                                        <span className="font-medium text-gray-900">
                                            {ad.status === 'PUBLISHED' ? 'Disponible' : 
                                             ad.status === 'SOLD' ? 'Vendu' : 'Brouillon'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID Annonce:</span>
                                        <span className="font-mono text-xs text-gray-900">{ad.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
