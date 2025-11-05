
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { FoodItem } from '../types';
import { LoadingIcon, PlusIcon, PencilIcon, TrashIcon } from '../components/icons';
import Modal from '../components/Modal';

const emptyFoodItem: Omit<FoodItem, 'id' | 'is_active'> & { is_active: boolean } = {
    name_ar: '',
    name_en: '',
    brand: '',
    category: '',
    per100: {
        carbs_g: 0,
        kcal: 0,
        protein_g: 0,
        fiber_g: 0,
        fat_g: 0,
    },
    is_active: true,
};

const AdminFoodsPage: React.FC = () => {
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodItem | Omit<FoodItem, 'id'>>(emptyFoodItem);
    const [formError, setFormError] = useState('');

    const fetchFoodItems = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await api.listFoodItems();
            if (error) throw new Error('Failed to fetch food items');
            setFoodItems(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFoodItems();
    }, [fetchFoodItems]);

    const handleOpenModal = (item: FoodItem | null = null) => {
        setEditingItem(item ? { ...item } : emptyFoodItem);
        setIsModalOpen(true);
        setFormError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name.startsWith('per100.')) {
            const key = name.split('.')[1] as keyof FoodItem['per100'];
            setEditingItem(prev => ({ ...prev, per100: { ...(prev.per100 || {}), [key]: value ? parseFloat(value) : null } }));
        } else if (type === 'checkbox') {
             setEditingItem(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        }
        else {
            setEditingItem(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!editingItem.name_ar) {
            setFormError('Arabic name is required.');
            return;
        }

        try {
            if ('id' in editingItem) {
                await api.updateFoodItem(editingItem);
            } else {
                await api.addFoodItem(editingItem);
            }
            await fetchFoodItems();
            handleCloseModal();
        } catch (err) {
            setFormError('Failed to save the item.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.deleteFoodItem(id);
                await fetchFoodItems();
            } catch (err) {
                setError('Failed to delete item.');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96"><LoadingIcon className="h-10 w-10 text-blue-600" /></div>;
    if (error) return <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Food Item Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Food
                </button>
            </div>
            
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name (AR)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name (EN)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Brand</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Carbs/100g</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {foodItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name_ar}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.name_en}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.brand}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.per100?.carbs_g}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={'id' in editingItem ? 'Edit Food Item' : 'Add Food Item'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && <p className="text-red-500 text-sm">{formError}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name_ar" className="block text-sm font-medium text-slate-700">Name (AR)</label>
                            <input type="text" name="name_ar" id="name_ar" value={editingItem.name_ar} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="name_en" className="block text-sm font-medium text-slate-700">Name (EN)</label>
                            <input type="text" name="name_en" id="name_en" value={editingItem.name_en || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-slate-700">Brand</label>
                            <input type="text" name="brand" id="brand" value={editingItem.brand || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
                            <input type="text" name="category" id="category" value={editingItem.category || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                    </div>
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-medium text-slate-700 px-1">Nutrition per 100g</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                             <div>
                                <label htmlFor="per100.carbs_g" className="block text-xs font-medium text-slate-600">Carbs (g)</label>
                                <input type="number" step="0.1" name="per100.carbs_g" id="per100.carbs_g" value={editingItem.per100?.carbs_g ?? ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="per100.kcal" className="block text-xs font-medium text-slate-600">Calories (kcal)</label>
                                <input type="number" step="1" name="per100.kcal" id="per100.kcal" value={editingItem.per100?.kcal ?? ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="per100.protein_g" className="block text-xs font-medium text-slate-600">Protein (g)</label>
                                <input type="number" step="0.1" name="per100.protein_g" id="per100.protein_g" value={editingItem.per100?.protein_g ?? ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="per100.fiber_g" className="block text-xs font-medium text-slate-600">Fiber (g)</label>
                                <input type="number" step="0.1" name="per100.fiber_g" id="per100.fiber_g" value={editingItem.per100?.fiber_g ?? ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="per100.fat_g" className="block text-xs font-medium text-slate-600">Fat (g)</label>
                                <input type="number" step="0.1" name="per100.fat_g" id="per100.fat_g" value={editingItem.per100?.fat_g ?? ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                        </div>
                    </fieldset>
                    <div className="flex items-center">
                        <input type="checkbox" name="is_active" id="is_active" checked={'is_active' in editingItem ? editingItem.is_active : true} onChange={handleChange} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900">Active</label>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminFoodsPage;
