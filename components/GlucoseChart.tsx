
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import type { Measurement, Target, GlucoseUnit } from '../types';
import { Units } from '../utils/units';

interface GlucoseChartProps {
    measurements: Measurement[];
    targetRange: Target;
    unit: GlucoseUnit;
}

const GlucoseChart: React.FC<GlucoseChartProps> = ({ measurements, targetRange, unit }) => {
    const chartData = measurements.map(m => ({
        time: new Date(m.at).getTime(),
        value: unit === 'mmol/L' ? Units.toMmolL(m.value) : m.value,
        context: m.context
    }));

    const yMin = unit === 'mmol/L' ? Units.toMmolL(targetRange.low) : targetRange.low;
    const yMax = unit === 'mmol/L' ? Units.toMmolL(targetRange.high) : targetRange.high;

    const formatXAxis = (tickItem: number) => {
        const date = new Date(tickItem);
        // Show date if it's the first tick or a new day
        if (new Date(tickItem).getHours() < 3) {
             return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-slate-200 rounded-md shadow-lg">
                    <p className="font-semibold">{`${payload[0].value} ${unit}`}</p>
                    <p className="text-sm text-slate-500">{new Date(label).toLocaleString()}</p>
                    {data.context && <p className="text-sm text-slate-500">Context: {data.context}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow h-96">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Glucose Readings</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                        dataKey="time" 
                        scale="time" 
                        type="number" 
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatXAxis} 
                        angle={-30}
                        textAnchor="end"
                        height={60}
                        tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                        domain={['dataMin - 20', 'dataMax + 20']} 
                        unit={unit} 
                        tick={{ fill: '#64748b' }}
                     />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ bottom: 0 }} />
                    <ReferenceArea y1={yMin} y2={yMax} strokeOpacity={0.3} fill="#a7f3d0" fillOpacity={0.3} label={{ value: "Target Range", position: "insideTopLeft", fill: "#047857", fontSize: 12, dy: 10, dx:10 }} />
                    <Line type="monotone" dataKey="value" name={`Glucose (${unit})`} stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GlucoseChart;