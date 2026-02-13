import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import Loading from '../components/Loading';

interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
}

interface Conversation {
    id: string;
    adId: string;
    adTitle: string;
    otherUser: string;
    lastMessage: string;
    updatedAt: string;
}

export default function MessagingPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setConversations([]);
            setIsLoading(false);
        }, 500);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setNewMessage('');
    };

    if (isLoading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    <div className="lg:col-span-1 card overflow-hidden">
                        <div className="p-4 border-b">
                            <h2 className="font-bold text-gray-900">Conversations</h2>
                        </div>

                        <div className="overflow-y-auto h-full">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 text-sm">Aucune conversation</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {conversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConv(conv.id)}
                                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                                selectedConv === conv.id ? 'bg-primary-50' : ''
                                            }`}
                                        >
                                            <h3 className="font-medium text-gray-900 mb-1">{conv.adTitle}</h3>
                                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 card overflow-hidden flex flex-col">
                        {!selectedConv ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Sélectionnez une conversation</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b">
                                    <h2 className="font-bold text-gray-900">Conversation</h2>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                    msg.senderId === user?.id
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-gray-200 text-gray-900'
                                                }`}
                                            >
                                                <p>{msg.content}</p>
                                                <p className="text-xs opacity-75 mt-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSendMessage} className="p-4 border-t">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Tapez votre message..."
                                            className="input-field flex-1"
                                        />
                                        <button type="submit" className="btn-primary">
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
