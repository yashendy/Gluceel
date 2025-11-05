
import React, { useState } from 'react';
import { api } from '../services/api';
import { Units } from '../utils/units';
import type { GlucoseUnit } from '../types';
import { PlusIcon, LoadingIcon } from './icons';

interface MeasurementLoggerProps {
    childId: string;
    unit: GlucoseUnit;
    onMeasurementAdded: () => void;
}

const MeasurementLogger: React.FC<MeasurementLoggerProps> = ({ childId, unit, onMeasurementAdded }) => {
    const [value, setValue] = useState('');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) {
            setError('Please enter a valid positive number.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const valueInMgdl = Units.toMgdl(numericValue, unit);
            const { error: apiError } = await api.addMeasurement(childId, valueInMgdl, context);

            if (apiError) {
                throw new Error('Failed to save measurement.');
            }

            setValue('');
            setContext('');
            onMeasurementAdded();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Log New Measurement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="glucose-value" className="block text-sm font-medium text-slate-600">
                        Glucose Value ({unit})
                    </label>
                    <input
                        id="glucose-value"
                        type="number"
                        step="any"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={unit === 'mg/dL' ? '120' : '6.7'}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="context" className="block text-sm font-medium text-slate-600">
                        Context (e.g., "After breakfast")
                    </label>
                    <input
                        id="context"
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Optional notes"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? (
                        <LoadingIcon className="h-5 w-5 mr-2" />
                    ) : (
                        <PlusIcon className="h-5 w-5 mr-2" />
                    )}
                    {loading ? 'Saving...' : 'Add Measurement'}
                </button>
            </form>
        </div>
    );
};

export default MeasurementLogger;
