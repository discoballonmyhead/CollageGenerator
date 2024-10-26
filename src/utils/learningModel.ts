// src/utils/learningModel.ts

import { RGB, colorDistance, histogramDistance } from './colorUtils';
import type { AssetImage, AlgorithmType } from '../types';

export function findBestMatch(
    targetColor: RGB,
    targetHistogram: number[],
    assets: AssetImage[],
    algorithm: AlgorithmType
): AssetImage | null {
    let minScore = Infinity;
    let bestMatch: AssetImage | null = null;

    const penaltyFactor = 0.1;

    for (const asset of assets) {
        let matchingScore = 0;

        if (algorithm === 'ColorMatch') {
            const assetColor = asset.averageColors[asset.averageColors.length - 1];
            const colorDist = colorDistance(targetColor, assetColor);
            matchingScore += colorDist;
        }

        if (algorithm === 'HistogramMatch') {
            const histogramDist = histogramDistance(targetHistogram, asset.histogram);
            matchingScore += histogramDist;
        }

        if (algorithm === 'PatternMatch') {
            // Consider both color and histogram distances
            const assetColor = asset.averageColors[asset.averageColors.length - 1];
            const colorDist = colorDistance(targetColor, assetColor);
            const histogramDist = histogramDistance(targetHistogram, asset.histogram);
            matchingScore += colorDist + histogramDist;

            // Additional pattern matching logic can be implemented here
            // For now, we'll keep it similar to HistogramMatch
        }

        if (algorithm === 'RotateMatch') {
            // Consider both color and histogram distances
            const assetColor = asset.averageColors[asset.averageColors.length - 1];
            const colorDist = colorDistance(targetColor, assetColor);
            const histogramDist = histogramDistance(targetHistogram, asset.histogram);
            matchingScore += colorDist + histogramDist;

            // Additional rotation-based pattern matching logic can be implemented here
            // For simplicity, we'll use color and histogram distances
        }

        // Apply usage penalty to distribute asset usage
        const usagePenalty = asset.usageCount * penaltyFactor;
        matchingScore += usagePenalty;

        if (matchingScore < minScore) {
            minScore = matchingScore;
            bestMatch = asset;
        }
    }

    return bestMatch;
}
