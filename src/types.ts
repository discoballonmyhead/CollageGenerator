// src/types.ts

import { RGB } from './utils/colorUtils';

export interface AssetImage {
    src: string;
    averageColors: RGB[];
    histogram: number[];
    usageCount: number;
    bitmap: ImageBitmap; // Essential for efficient processing in Web Workers
}

export type AlgorithmType = 'ColorMatch' | 'HistogramMatch' | 'PatternMatch' | 'RotateMatch';

// Define IconUsageMap
export type IconUsageMap = { [iconName: string]: number };
