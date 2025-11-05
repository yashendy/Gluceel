
import React from 'react';
import type { Child } from '../types';
import { UserGroupIcon, ChevronDownIcon } from './icons';

interface ChildSelectorProps {
    children: Child[];
    selectedChildId: string | null;
    onSelectChild: (id: string) => void;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({ children, selectedChildId, onSelectChild }) => {
    const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onSelectChild(event.target.value);
    };

    return (
        <div className="relative">
             <UserGroupIcon className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-3 text-slate-400" />
            <select
                aria-label="Select Child"
                value={selectedChildId || ''}
                onChange={handleSelectionChange}
                className="appearance-none w-full md:w-48 bg-slate-100 border border-slate-200 text-slate-700 py-2 pl-10 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
                {children.map((child) => (
                    <option key={child.id} value={child.id}>
                        {child.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <ChevronDownIcon className="h-4 w-4"/>
            </div>
        </div>
    );
};

export default ChildSelector;
