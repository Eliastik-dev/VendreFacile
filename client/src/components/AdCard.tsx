import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import type { Ad } from '../services/adService';

interface AdCardProps {
    ad: Ad;
}

export default function AdCard({ ad }: AdCardProps) {
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: ad.price.currency,
    }).format(ad.price.amount);

    const timeAgo = getTimeAgo(new Date(ad.createdAt));

    return (
        <Link to={`/ads/${ad.id}`} className="card overflow-hidden block">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {ad.images && ad.images.length > 0 ? (
                    <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-primary-600 text-sm font-medium">Pas d'image</div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                    {ad.title}
                </h3>

                <p className="text-2xl font-bold text-primary-600 mb-3">
                    {formattedPrice}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{ad.location.city}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{timeAgo}</span>
                    </div>
                </div>

                <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {ad.category}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    const intervals = {
        an: 31536000,
        mois: 2592000,
        jour: 86400,
        heure: 3600,
        minute: 60,
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return `Il y a ${interval} ${name}${interval > 1 && name !== 'mois' ? 's' : ''}`;
        }
    }

    return 'Maintenant';
}
