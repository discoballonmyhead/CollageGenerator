/// <reference lib="webworker" />

import { getAverageColor, computeHistogram } from '../utils/colorUtils';
import { findBestMatch } from '../utils/learningModel';
import type { AssetImage, AlgorithmType } from '../types';

interface ProcessImageData {
    imageData: ImageData;
    assets: AssetImage[];
    chunkSize: number;
    algorithm: AlgorithmType;
    overlap: number; // 0 (no overlap) to 70 (max overlap)
}

self.onmessage = async (event: MessageEvent) => {
    const { imageData, assets, chunkSize, algorithm, overlap } = event.data as ProcessImageData;
    const { width, height } = imageData;

    const offScreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offScreenCanvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    // Initialize or reset usage counts
    assets.forEach((asset) => (asset.usageCount = 0));

    let processedChunks = 0;
    const totalChunks = Math.ceil(width / chunkSize) * Math.ceil(height / chunkSize);

    for (let y = 0; y < height; y += chunkSize) {
        for (let x = 0; x < width; x += chunkSize) {
            const sw = Math.min(chunkSize, width - x);
            const sh = Math.min(chunkSize, height - y);

            const chunkImageData = ctx.getImageData(x, y, sw, sh);
            const averageColor = getAverageColor(chunkImageData);
            const histogram = computeHistogram(chunkImageData);

            const match = findBestMatch(averageColor, histogram, assets, algorithm);

            if (match && match.bitmap) { // Ensure bitmap exists
                ctx.save();

                if (algorithm === 'RotateMatch') {
                    // Fixed rotation angles: 0, 90, 180, 270 degrees
                    const rotationAngles = [0, 90, 180, 270];
                    const rotationDegrees = rotationAngles[Math.floor(Math.random() * rotationAngles.length)];
                    const rotation = (rotationDegrees * Math.PI) / 180;

                    // Center of the chunk
                    ctx.translate(x + sw / 2, y + sh / 2);
                    ctx.rotate(rotation);
                    ctx.drawImage(
                        match.bitmap,
                        -sw / 2,
                        -sh / 2,
                        sw,
                        sh
                    );
                } else if (algorithm === 'PatternMatch') {
                    // Calculate position with overlap
                    const overlapOffsetX = (overlap / 100) * sw;
                    const overlapOffsetY = (overlap / 100) * sh;

                    // Adjust position based on overlap offsets
                    ctx.translate(x + sw / 2 - overlapOffsetX / 2, y + sh / 2 - overlapOffsetY / 2);
                    ctx.drawImage(
                        match.bitmap,
                        -sw / 2,
                        -sh / 2,
                        sw,
                        sh
                    );
                } else {
                    // For ColorMatch and HistogramMatch
                    ctx.translate(x + sw / 2, y + sh / 2);
                    ctx.drawImage(
                        match.bitmap,
                        -sw / 2,
                        -sh / 2,
                        sw,
                        sh
                    );
                }

                ctx.restore();
            } else {
                // Fill with average color
                ctx.fillStyle = `rgb(${averageColor.r}, ${averageColor.g}, ${averageColor.b})`;
                ctx.fillRect(x, y, sw, sh);
            }

            processedChunks++;
            const currentProgress = (processedChunks / totalChunks) * 100;
            self.postMessage({ progress: currentProgress }); // Send progress update
        }
    }

    const processedImageData = ctx.getImageData(0, 0, width, height);
    self.postMessage({ processedImageData }, [processedImageData.data.buffer]);
};
