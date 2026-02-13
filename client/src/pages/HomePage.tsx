import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import AdCard from '../components/AdCard';
import Loading from '../components/Loading';
import { searchService, type SearchParams } from '../services/searchService';
import type { Ad } from '../services/adService';

export default function HomePage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchParams>({ page: 1, limit: 12 });
    const navigate = useNavigate();

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async (params: SearchParams = { page: 1, limit: 12 }) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await searchService.search(params);
            setAds(result.ads);
            setSearchParams(params);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erreur lors du chargement des annonces');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (params: SearchParams) => {
        loadAds({ ...params, page: 1, limit: 12 });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Trouvez ce que vous cherchez
                        </h1>
                        <p className="text-xl text-primary-100">
                            Des milliers d'annonces près de chez vous
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <SearchBar onSearch={handleSearch} initialParams={searchParams} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {searchParams.keyword ? `Résultats pour "${searchParams.keyword}"` : 'Dernières annonces'}
                    </h2>
                    <span className="text-gray-600">{ads.length} annonces</span>
                </div>

                {isLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : ads.length === 0 ? (
                    <div className="text-center py-16">
                        <PackageOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune annonce trouvée</h3>
                        <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {ads.map((ad) => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
