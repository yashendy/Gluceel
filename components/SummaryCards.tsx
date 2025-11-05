
import React from 'react';
import type { Summary, GlucoseUnit } from '../types';
import { Units } from '../utils/units';
import { ChartBarIcon, ClockIcon } from './icons';

interface SummaryCardsProps {
    summary: Summary[];
    unit: GlucoseUnit;
}

const SummaryCard: React.FC<{ title: string, value: string, icon: React.ReactNode, description: string, colorClass: string }> = ({ title, value, icon, description, colorClass }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-start space-x-4">
        <div className={`p-2 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400">{description}</p>
        </div>
    </div>
);

const TimeInRangeIndicator: React.FC<{ tir: number, tib: number, tia: number }> = ({ tir, tib, tia }) => (
    <div>
        <div className="flex w-full h-2 rounded-full overflow-hidden mb-1">
            <div className="bg-red-400" style={{ width: `${tib * 100}%` }}></div>
            <div className="bg-green-400" style={{ width: `${tir * 100}%` }}></div>
            <div className="bg-yellow-400" style={{ width: `${tia * 100}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
            <span><span className="text-red-500 font-semibold">Below</span> {Math.round(tib * 100)}%</span>
            <span><span className="text-green-600 font-semibold">In Range</span> {Math.round(tir * 100)}%</span>
            <span><span className="text-yellow-500 font-semibold">Above</span> {Math.round(tia * 100)}%</span>
        </div>
    </div>
);


const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, unit }) => {
    const summaryData = summary.find(s => s.period_days === 7); // Use 7-day summary for main cards

    if (!summaryData) {
        return <div className="text-center text-slate-500 p-4 bg-white rounded-lg shadow">No summary data available.</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SummaryCard 
                    title="Average Glucose"
                    value={`${Units.format(summaryData.avg_glucose, unit)} ${unit}`}
                    description={`Last ${summaryData.period_days} days`}
                    icon={<ChartBarIcon className="h-6 w-6 text-indigo-700"/>}
                    colorClass="bg-indigo-100"
                />
                 <SummaryCard 
                    title="Time in Range"
                    value={`${(summaryData.time_in_range * 100).toFixed(0)}%`}
                    description={`Last ${summaryData.period_days} days`}
                    icon={<ClockIcon className="h-6 w-6 text-green-700"/>}
                    colorClass="bg-green-100"
                />
            </div>
            <div className="bg-white p-4 mt-4 rounded-lg shadow">
                 <h4 className="text-sm font-medium text-slate-600 mb-2">Time in Range Distribution (7 days)</h4>
                 <TimeInRangeIndicator 
                    tir={summaryData.time_in_range}
                    tib={summaryData.time_below_range}
                    tia={summaryData.time_above_range}
                 />
            </div>
        </div>

    );
};

export default SummaryCards;