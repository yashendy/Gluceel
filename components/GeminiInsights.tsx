import React, { useState, useEffect, useCallback } from 'react';
import { analyzeGlucoseData } from '../services/geminiService';
import type { Measurement, Summary, Target, GlucoseUnit } from '../types';
import { SparklesIcon, RefreshIcon, LoadingIcon } from './icons';

// A more robust markdown to HTML renderer
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    let html = '';
    let inList = false;

    const processBold = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Close list if current line is not a list item
        if (!trimmedLine.match(/^\s*-\s/) && inList) {
            html += '</ul>';
            inList = false;
        }

        if (trimmedLine.startsWith('###')) {
            html += `<h3>${processBold(trimmedLine.substring(3).trim())}</h3>`;
        } else if (trimmedLine.startsWith('##')) {
            html += `<h2>${processBold(trimmedLine.substring(2).trim())}</h2>`;
        } else if (trimmedLine.startsWith('#')) {
            html += `<h1>${processBold(trimmedLine.substring(1).trim())}</h1>`;
        } else if (trimmedLine.match(/^\s*-\s/)) {
            if (!inList) {
                html += '<ul class="list-disc list-inside space-y-1">';
                inList = true;
            }
            html += `<li>${processBold(trimmedLine.replace(/^\s*-\s/, '').trim())}</li>`;
        } else if (trimmedLine.length > 0) {
            html += `<p>${processBold(trimmedLine)}</p>`;
        }
    });

    if (inList) {
        html += '</ul>'; // Close list if it's the last element
    }

    return <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: html }} />;
};

interface GeminiInsightsProps {
    childName: string;
    measurements: Measurement[];
    summary: Summary[];
    targets: Target;
    unit: GlucoseUnit;
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ childName, measurements, summary, targets, unit }) => {
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await analyzeGlucoseData(childName, measurements, summary, targets, unit);
            setInsights(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get insights.');
            setInsights(null);
        } finally {
            setLoading(false);
        }
    }, [childName, measurements, summary, targets, unit]);

    useEffect(() => {
        fetchInsights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childName]); // Fetch only when child changes, not on every measurement change to avoid too many calls. User can manually refresh.

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    AI Insights
                </h3>
                <button onClick={fetchInsights} disabled={loading} className="p-1 text-slate-500 hover:text-blue-600 disabled:text-slate-300" aria-label="Refresh AI Insights">
                    {loading ? <LoadingIcon className="h-5 w-5" /> : <RefreshIcon className="h-5 w-5" />}
                </button>
            </div>
            
            {loading && (
                 <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4 mt-4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                 </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && insights && <MarkdownRenderer content={insights} />}
        </div>
    );
};

export default GeminiInsights;