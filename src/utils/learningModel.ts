import { RGB, colorDistance, histogramDistance } from './colorUtils';
import { AssetImage } from './imageProcessing';

export function findBestMatch(
    targetColor: RGB,
    targetHistogram: number[],
    assets: AssetImage[]
): AssetImage | null {
    let minScore = Infinity;
    let bestMatch: AssetImage | null = null;

    const penaltyFactor = 0.1;

    for (const asset of assets) {
        const assetColor = asset.averageColors[asset.averageColors.length - 1];
        const colorDist = colorDistance(targetColor, assetColor);

        const histogramDist = histogramDistance(targetHistogram, asset.histogram);

        const usagePenalty = asset.usageCount * penaltyFactor;

        const matchingScore = colorDist + histogramDist + usagePenalty;

        if (matchingScore < minScore) {
            minScore = matchingScore;
            bestMatch = asset;
        }
    }

    return bestMatch;
}
