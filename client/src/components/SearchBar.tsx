import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { SearchParams } from '../services/searchService';

interface SearchBarProps {
    onSearch: (params: SearchParams) => void;
    initialParams?: SearchParams;
}

const CATEGORIES = [
    'Tous',
    'Automobile',
    'Immobilier',
    'Électronique',
    'Maison',
    'Mode',
    'Loisirs',
    'Emploi',
    'Services',
];

export default function SearchBar({ onSearch, initialParams }: SearchBarProps) {
    const [keyword, setKeyword] = useState(initialParams?.keyword || '');
    const [category, setCategory] = useState(initialParams?.category || '');
    const [city, setCity] = useState(initialParams?.city || '');
    const [minPrice, setMinPrice] = useState(initialParams?.minPrice?.toString() || '');
    const [maxPrice, setMaxPrice] = useState(initialParams?.maxPrice?.toString() || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const params: SearchParams = {
            keyword: keyword || undefined,
            category: category && category !== 'Tous' ? category : undefined,
            city: city || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        };

        onSearch(params);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une annonce..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field md:w-48"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat === 'Tous' ? '' : cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary md:hidden flex items-center justify-center space-x-2"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filtres</span>
                    </button>

                    <button type="submit" className="btn-primary md:w-32">
                        Rechercher
                    </button>
                </div>

                <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 ${showFilters || window.innerWidth >= 768 ? '' : 'hidden md:grid'}`}>
                    <input
                        type="text"
                        placeholder="Ville"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Prix min (€)"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="number"
                        placeholder="Prix max (€)"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="input-field"
                    />
                </div>
            </form>
        </div>
    );
}
