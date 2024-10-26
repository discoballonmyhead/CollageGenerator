/// <reference lib="webworker" />

import { getAverageColor, computeHistogram } from '../utils/colorUtils';
import { findBestMatch } from '../utils/learningModel';
import { AssetImage } from '../utils/imageProcessing';

interface ProcessImageData {
    imageData: ImageData;
    assets: AssetImage[];
    chunkSize: number;
}

self.onmessage = async (event: MessageEvent) => {
    const { imageData, assets, chunkSize } = event.data as ProcessImageData;
    const { width, height } = imageData;

    const offScreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offScreenCanvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    // Initialize or reset usage counts
    assets.forEach((asset) => (asset.usageCount = 0));

    for (let y = 0; y < height; y += chunkSize) {
        for (let x = 0; x < width; x += chunkSize) {
            const sw = Math.min(chunkSize, width - x);
            const sh = Math.min(chunkSize, height - y);

            const chunkImageData = ctx.getImageData(x, y, sw, sh);
            const averageColor = getAverageColor(chunkImageData);
            const histogram = computeHistogram(chunkImageData);

            const match = findBestMatch(averageColor, histogram, assets);

            if (match) {
                const assetBitmap = match.bitmap;
                ctx.drawImage(
                    assetBitmap,
                    0,
                    0,
                    assetBitmap.width,
                    assetBitmap.height,
                    x,
                    y,
                    sw,
                    sh
                );
            } else {
                // Fill with average color
                ctx.fillStyle = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
                ctx.fillRect(x, y, sw, sh);
            }
        }
    }

    const processedImageData = ctx.getImageData(0, 0, width, height);
    self.postMessage({ processedImageData }, [processedImageData.data.buffer]);
};
