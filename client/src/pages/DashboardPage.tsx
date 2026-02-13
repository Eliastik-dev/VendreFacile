import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, User, Edit, CheckCircle } from 'lucide-react';
import { adService, type Ad } from '../services/adService';
import { useAuthStore } from '../stores/useAuthStore';
import Loading from '../components/Loading';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'my-ads' | 'favorites'>('my-ads');
    const [myAds, setMyAds] = useState<Ad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        loadMyAds();
    }, [user]);

    const loadMyAds = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            const ads = await adService.getAds({ sellerId: user.id });
            setMyAds(ads);
        } catch (error) {
            console.error('Error loading ads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async (adId: string) => {
        // Optimistic update
        const previousAds = [...myAds];
        setMyAds(ads => ads.map(ad => 
            ad.id === adId ? { ...ad, status: 'PUBLISHED' } : ad
        ));

        try {
            await adService.publishAd(adId);
            // No need to reload, state is already correct
        } catch (error) {
            console.error('Error publishing ad:', error);
            // Revert on error
            setMyAds(previousAds);
            alert('Erreur lors de la publication de l\'annonce');
        }
    };

    const handleMarkAsSold = async (adId: string) => {
        // Optimistic update
        const previousAds = [...myAds];
        setMyAds(ads => ads.map(ad => 
            ad.id === adId ? { ...ad, status: 'SOLD' } : ad
        ));

        try {
            await adService.markAsSold(adId);
            // No need to reload, state is already correct
        } catch (error) {
            console.error('Error marking as sold:', error);
            // Revert on error
            setMyAds(previousAds);
            alert('Erreur lors du marquage comme vendu');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon compte</h1>
                    <p className="text-gray-600">Gérez vos annonces et vos favoris</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <div className="card p-6 mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user?.email}</p>
                                    <p className="text-sm text-gray-600">Utilisateur</p>
                                </div>
                            </div>
                            <Link to="/profile" className="btn-outline w-full">
                                Modifier le profil
                            </Link>
                        </div>

                        <nav className="card overflow-hidden">
                            <button
                                onClick={() => setActiveTab('my-ads')}
                                className={`w-full px-6 py-4 flex items-center space-x-3 transition-colors ${
                                    activeTab === 'my-ads'
                                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                                        : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <Package className="w-5 h-5" />
                                <span className="font-medium">Mes annonces</span>
                                <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                    {myAds.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`w-full px-6 py-4 flex items-center space-x-3 transition-colors ${
                                    activeTab === 'favorites'
                                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                                        : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <Heart className="w-5 h-5" />
                                <span className="font-medium">Mes favoris</span>
                                <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                    0
                                </span>
                            </button>
                        </nav>
                    </div>

                    <div className="lg:col-span-3">
                        {activeTab === 'my-ads' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Mes annonces</h2>
                                    <Link to="/create-ad" className="btn-primary">
                                        + Créer une annonce
                                    </Link>
                                </div>

                                {isLoading ? (
                                    <Loading />
                                ) : myAds.length === 0 ? (
                                    <div className="card p-12 text-center">
                                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            Aucune annonce
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            Vous n'avez pas encore créé d'annonce
                                        </p>
                                        <Link to="/create-ad" className="btn-primary">
                                            Créer ma première annonce
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myAds.map((ad) => (
                                            <div key={ad.id} className="card p-6">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg overflow-hidden">
                                                        {ad.images && ad.images.length > 0 ? (
                                                            <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-primary-600 text-xs">
                                                                Pas d'image
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                                    {ad.title}
                                                                </h3>
                                                                <p className="text-2xl font-bold text-primary-600">
                                                                    {new Intl.NumberFormat('fr-FR', {
                                                                        style: 'currency',
                                                                        currency: ad.price.currency,
                                                                    }).format(ad.price.amount)}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    ad.status === 'PUBLISHED'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : ad.status === 'SOLD'
                                                                        ? 'bg-gray-100 text-gray-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}
                                                            >
                                                                {ad.status === 'PUBLISHED'
                                                                    ? 'Publiée'
                                                                    : ad.status === 'SOLD'
                                                                    ? 'Vendue'
                                                                    : 'Brouillon'}
                                                            </span>
                                                        </div>

                                                        <p className="text-gray-600 mb-4 line-clamp-2">{ad.description}</p>

                                                        <div className="flex items-center space-x-2">
                                                            <Link to={`/ads/${ad.id}`} className="btn-outline text-sm">
                                                                <Edit className="w-4 h-4 inline mr-1" />
                                                                Voir
                                                            </Link>
                                                            {ad.status === 'DRAFT' && (
                                                                <button
                                                                    onClick={() => handlePublish(ad.id)}
                                                                    className="btn-primary text-sm"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                    Publier
                                                                </button>
                                                            )}
                                                            {ad.status === 'PUBLISHED' && (
                                                                <button
                                                                    onClick={() => handleMarkAsSold(ad.id)}
                                                                    className="btn-secondary text-sm"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                                                    Marquer comme vendu
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes favoris</h2>
                                <div className="card p-12 text-center">
                                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                        Aucun favori
                                    </h3>
                                    <p className="text-gray-500">
                                        Vous n'avez pas encore ajouté d'annonces à vos favoris
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
