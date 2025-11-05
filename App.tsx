
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminFoodsPage from './pages/AdminFoodsPage';
import AuthPage from './pages/AuthPage';
import { api } from './services/api';
import type { Child } from './types';
import { LoadingIcon } from './components/icons';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
    const { session, profile, userSettings, loading: authLoading } = useAuth();
    
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [route, setRoute] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash || '#/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        }

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const { data: childrenData, error: childrenError } = await api.listChildren();

                if (childrenError) throw new Error('Failed to fetch children');
                
                if (childrenData) {
                    setChildren(childrenData);
                    // TODO: The logic for default_child_id needs to be determined from user settings
                    const defaultChildId = childrenData[0]?.id;
                    if (defaultChildId) {
                        setSelectedChildId(defaultChildId);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [session]);

    const handleSelectChild = (id: string) => {
        setSelectedChildId(id);
    };

    const renderPage = () => {
        if (route.startsWith('#/admin/foods')) {
            if (profile?.role === 'admin') {
                return <AdminFoodsPage />;
            }
            return <div className="text-center py-20"><h2 className="text-2xl font-semibold text-red-700">Access Denied</h2><p className="mt-2 text-slate-500">You do not have permission to view this page.</p></div>
        }

        if (selectedChildId && userSettings) {
            const selectedChildName = children.find(c => c.id === selectedChildId)?.name || 'Dashboard';
            return <Dashboard 
                key={selectedChildId} 
                childId={selectedChildId} 
                childName={selectedChildName}
                preferredUnit={userSettings.unit_glucose || 'mg/dL'}
            />;
        }

        return (
             <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-slate-700">Welcome to Gluceel</h2>
                <p className="mt-2 text-slate-500">Please select a child from the dropdown to view their dashboard.</p>
            </div>
        );
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <LoadingIcon className="h-12 w-12 text-blue-600" />
            </div>
        );
    }
    
    if (!session) {
        return <AuthPage />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-700">
                <p>Error: {error}</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-50">
            <Header
                children={children}
                selectedChildId={selectedChildId}
                onSelectChild={handleSelectChild}
            />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
