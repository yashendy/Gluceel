
import type { GlucoseUnit } from '../types';

const MG_DL_PER_MMOL_L = 18.0182;

export const Units = {
    toMmolL: (mgdl: number): number => {
        return parseFloat((mgdl / MG_DL_PER_MMOL_L).toFixed(1));
    },

    toMgdl: (val: number, unit: GlucoseUnit): number => {
        if (unit === 'mmol/L') {
            return Math.round(val * MG_DL_PER_MMOL_L);
        }
        return Math.round(val);
    },

    convert: (val: number, fromUnit: GlucoseUnit, toUnit: GlucoseUnit): number => {
        if (fromUnit === toUnit) {
            return val;
        }
        if (toUnit === 'mmol/L') {
            return Units.toMmolL(val);
        }
        // This implies converting from mmol/L to mg/dL
        return Units.toMgdl(val, 'mmol/L');
    },

    format: (valMgdl: number, unit: GlucoseUnit): string => {
        if (unit === 'mmol/L') {
            return Units.toMmolL(valMgdl).toString();
        }
        return Math.round(valMgdl).toString();
    }
};