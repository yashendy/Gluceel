
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Measurement, Summary, Target } from '../types';

interface DashboardData {
    measurements: Measurement[];
    targets: Target | null;
    summary: Summary[];
}

interface UseDashboardDataResult {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useDashboardData = (childId: string | null): UseDashboardDataResult => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!childId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [
                { data: measurementsData, error: measurementsError },
                { data: targetsData, error: targetsError },
                { data: summaryData, error: summaryError }
            ] = await Promise.all([
                api.listMeasurements(childId),
                api.getTargets(childId),
                api.getSummary(childId)
            ]);

            if (measurementsError || targetsError || summaryError) {
                console.error({ measurementsError, targetsError, summaryError });
                throw new Error("Failed to fetch dashboard data.");
            }

            setData({
                measurements: measurementsData || [],
                targets: targetsData || null,
                summary: summaryData || []
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};
