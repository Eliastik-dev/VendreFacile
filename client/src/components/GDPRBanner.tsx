import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function GDPRBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('gdpr-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('gdpr-consent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('gdpr-consent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                        <Cookie className="w-8 h-8 text-primary-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Cookies et confidentialité</h3>
                            <p className="text-sm text-gray-600">
                                Nous utilisons des cookies pour améliorer votre expérience. En continuant à naviguer sur ce site, vous acceptez notre{' '}
                                <a href="#" className="text-primary-600 hover:underline">
                                    politique de confidentialité
                                </a>{' '}
                                et l'utilisation de cookies conformément au RGPD.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <button
                            onClick={handleReject}
                            className="btn-secondary flex-1 md:flex-none"
                        >
                            Refuser
                        </button>
                        <button
                            onClick={handleAccept}
                            className="btn-primary flex-1 md:flex-none"
                        >
                            Accepter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
