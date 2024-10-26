// src/utils/imageProcessing.ts

import { AssetImage } from '../types';
import { RGB, getAverageColor, computeHistogram } from './colorUtils';

// Function to load an image from a source URL
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
}

// Function to load all asset images dynamically
export async function loadAssetImages(): Promise<AssetImage[]> {
    const images = import.meta.glob('../assets/icons/*.png', {
        eager: true,
        as: 'url',
    });

    const assetPromises = Object.values(images).map(async (src: string) => {
        const img = await loadImage(src);
        const bitmap = await createImageBitmap(img); // Create ImageBitmap

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 128, 128);

        const imageData = ctx.getImageData(0, 0, 128, 128);
        const averageColors: RGB[] = [];

        // Divide into 9 partitions (3x3 grid)
        const partitionSize = Math.ceil(128 / 3);
        for (let y = 0; y < 128; y += partitionSize) {
            for (let x = 0; x < 128; x += partitionSize) {
                const sw = Math.min(partitionSize, 128 - x);
                const sh = Math.min(partitionSize, 128 - y);
                const color = getAverageColor(imageData, x, y, sw, sh);
                averageColors.push(color);
            }
        }
        const overallAverage = getAverageColor(imageData);
        averageColors.push(overallAverage);
        const histogram = computeHistogram(imageData);

        return { src, averageColors, histogram, usageCount: 0, bitmap };
    });

    return Promise.all(assetPromises);
}
