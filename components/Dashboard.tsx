
import React from 'react';
import GlucoseChart from './GlucoseChart';
import SummaryCards from './SummaryCards';
import MeasurementLogger from './MeasurementLogger';
import GeminiInsights from './GeminiInsights';
import { LoadingIcon } from './icons';
import { useDashboardData } from '../hooks/useDashboardData';
import type { GlucoseUnit } from '../types';

interface DashboardProps {
    childId: string;
    childName: string;
    preferredUnit: GlucoseUnit;
}

const Dashboard: React.FC<DashboardProps> = ({ childId, childName, preferredUnit }) => {
    const { data, loading, error, refetch } = useDashboardData(childId);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingIcon className="h-10 w-10 text-blue-600" /></div>;
    }

    if (error || !data) {
        return <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">Error: {error || 'Could not load data.'}</div>;
    }
    
    const { measurements, targets, summary } = data;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard for {childName}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {targets && measurements.length > 0 ? (
                        <GlucoseChart 
                            measurements={measurements} 
                            targetRange={targets} 
                            unit={preferredUnit} 
                        />
                    ) : (
                         <div className="bg-white rounded-lg shadow p-6 text-center text-slate-500 h-96 flex items-center justify-center">No measurement data to display.</div>
                    )}
                    <SummaryCards summary={summary} unit={preferredUnit} />
                </div>

                <div className="space-y-6">
                    <MeasurementLogger childId={childId} unit={preferredUnit} onMeasurementAdded={refetch} />
                    {targets && <GeminiInsights 
                        childName={childName}
                        measurements={measurements} 
                        summary={summary} 
                        targets={targets} 
                        unit={preferredUnit}
                    />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
