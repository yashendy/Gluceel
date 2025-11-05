import { GoogleGenAI } from "@google/genai";
import type { Measurement, Summary, Target, GlucoseUnit } from '../types';
import { Units } from '../utils/units';

// This is a placeholder for the actual API key which should be
// securely managed, e.g., through environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const formatDataForPrompt = (
    measurements: Measurement[],
    summary: Summary[],
    targets: Target,
    unit: GlucoseUnit
) => {
    const recentMeasurements = measurements.slice(-15).map(m => ({
        value: `${Units.format(m.value, unit)} ${unit}`,
        context: m.context,
        time: new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const formattedSummary = summary.map(s => ({
        [`last_${s.period_days}_days`]: {
            average_glucose: `${Units.format(s.avg_glucose, unit)} ${unit}`,
            time_in_range: `${(s.time_in_range * 100).toFixed(0)}%`,
            time_above_range: `${(s.time_above_range * 100).toFixed(0)}%`,
            time_below_range: `${(s.time_below_range * 100).toFixed(0)}%`
        }
    }));

    const formattedTargets = {
        low: `${Units.format(targets.low, unit)} ${unit}`,
        high: `${Units.format(targets.high, unit)} ${unit}`
    };

    return JSON.stringify({
        target_range: formattedTargets,
        recent_measurements: recentMeasurements,
        summary_statistics: formattedSummary
    }, null, 2);
};


export const analyzeGlucoseData = async (
    childName: string,
    measurements: Measurement[],
    summary: Summary[],
    targets: Target,
    unit: GlucoseUnit
): Promise<string> => {
    if (!API_KEY) {
        return "Gemini API key is not configured. AI analysis is unavailable.";
    }

    if (!measurements?.length || !summary?.length || !targets) {
        return "Not enough data for an analysis.";
    }

    const dataString = formatDataForPrompt(measurements, summary, targets, unit);

    const prompt = `
        You are a helpful, empathetic assistant for a parent managing their child's Type 1 Diabetes.
        Your tone should be supportive and informative, but you MUST NOT provide medical advice.
        Always include a disclaimer: "This is not medical advice. Always consult with your healthcare provider."

        Analyze the following glucose data for a child named ${childName}. The data is in JSON format.

        Data:
        ${dataString}

        Based on the data, provide a brief, easy-to-understand summary in Markdown format.
        Your response should have two sections:
        
        1.  **Summary:** A short (2-3 sentences) overview of the recent data.
        2.  **Observations:** 2-3 bullet points identifying any potential patterns or noteworthy points. Focus on trends, not single values. For example, mention if there's a pattern of high readings after a certain mealtime context, or frequent lows overnight.

        Keep the language simple and clear. Do not repeat the raw numbers from the JSON; interpret them.
    `;
    
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "There was an error analyzing the data with AI. Please try again later.";
    }
};