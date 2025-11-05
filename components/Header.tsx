
import React from 'react';
import ChildSelector from './ChildSelector';
import type { Child } from '../types';
import { LogoIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    children: Child[];
    selectedChildId: string | null;
    onSelectChild: (id: string) => void;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode; isActive: boolean }> = ({ href, children, isActive }) => (
    <a href={href} className={`px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
        {children}
    </a>
);

const Header: React.FC<HeaderProps> = ({ children, selectedChildId, onSelectChild }) => {
    const { profile, signOut } = useAuth();
    const currentHash = window.location.hash || '#/';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <LogoIcon className="h-8 w-8" />
                        <a href="#/" className="text-xl font-semibold text-slate-800">Gluceel</a>
                    </div>

                    <nav className="hidden md:flex items-center space-x-4">
                        <NavLink href="#/" isActive={currentHash === '#/'}>Dashboard</NavLink>
                        {profile?.role === 'admin' && (
                            <NavLink href="#/admin/foods" isActive={currentHash.startsWith('#/admin')}>Admin</NavLink>
                        )}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {children.length > 0 && (
                             <ChildSelector
                                children={children}
                                selectedChildId={selectedChildId}
                                onSelectChild={onSelectChild}
                            />
                        )}
                        {profile && (
                             <div className="flex items-center space-x-3">
                                <img
                                    className="h-9 w-9 rounded-full"
                                    src={profile.avatar_url || `https://i.pravatar.cc/100?u=${profile.user_id}`}
                                    alt={profile.full_name || 'User'}
                                />
                                <span className="hidden lg:inline text-sm font-medium text-slate-700">{profile.full_name}</span>
                                <button
                                  onClick={signOut}
                                  className="text-sm text-slate-500 hover:text-blue-600"
                                  aria-label="Sign Out"
                                >
                                  Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
