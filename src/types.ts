// src/types.ts

import { RGB } from './utils/colorUtils';

export interface AssetImage {
    src: string;
    averageColors: RGB[];
    histogram: number[];
    usageCount: number;
    bitmap: ImageBitmap; // Essential for efficient processing in Web Workers
}
