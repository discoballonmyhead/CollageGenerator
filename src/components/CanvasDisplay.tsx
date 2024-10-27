// src/components/CanvasDisplay.tsx

import React, { useEffect, useRef, useState } from 'react';
import { AssetImage, AlgorithmType, IconUsageMap } from '../types';
import { loadAssetImages, loadImage } from '../utils/imageProcessing';
import heic2any from 'heic2any';

// Import the worker as a module
import ImageProcessorWorker from '../workers/imageProcessor.worker.ts?worker';

interface Props {
    imageFile: File | null;
    chunkSize: number;
    scaleFactor: number;
    processing: boolean;
    mosaicReady: boolean;
    algorithm: AlgorithmType;
    overlap: number;
    showWatermark: boolean;
    showIconUsageOverlay: boolean;
    onProcessingChange: (isProcessing: boolean) => void;
    onMosaicReady: (isReady: boolean, usage?: IconUsageMap) => void;
}

const CanvasDisplay: React.FC<Props> = ({
    imageFile,
    chunkSize,
    scaleFactor,
    processing,
    mosaicReady,
    algorithm,
    overlap,
    showWatermark,
    showIconUsageOverlay,
    onProcessingChange,
    onMosaicReady,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [assets, setAssets] = useState<AssetImage[]>([]);
    const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
    const [progress, setProgress] = useState<number>(0); // Define progress state
    const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        // Preload assets on application load
        const preloadAssets = async () => {
            try {
                const loadedAssets = await loadAssetImages();

                // Assets are already loaded with bitmap in loadAssetImages
                setAssets(loadedAssets);
            } catch (err) {
                console.error('Error loading assets:', err);
            }
        };

        preloadAssets();
    }, []);

    useEffect(() => {
        if (imageFile) {
            // Reset states
            onMosaicReady(false);
            onProcessingChange(false);
            setProgress(0); // Reset progress

            const loadAndDrawImage = async () => {
                try {
                    let file = imageFile;

                    // Handle HEIC files
                    if (file.type === 'image/heic' || file.type === 'image/heif') {
                        const convertedBlob = (await heic2any({
                            blob: file,
                            toType: 'image/jpeg',
                            quality: 0.8,
                        })) as Blob;

                        file = new File([convertedBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                            type: 'image/jpeg',
                        });
                    }

                    const img = await loadImage(URL.createObjectURL(file));
                    setUploadedImage(img);
                    drawImage(img);
                } catch (err) {
                    console.error('Error loading uploaded image:', err);
                }
            };

            loadAndDrawImage();
        }
    }, [imageFile, scaleFactor]);

    const drawImage = (img: HTMLImageElement) => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        // Apply scaling factor
        let scaledWidth = img.width * scaleFactor;
        let scaledHeight = img.height * scaleFactor;

        // Limit the maximum dimensions
        const maxDimension = 4096; // Adjust based on your requirements and testing
        if (scaledWidth > maxDimension || scaledHeight > maxDimension) {
            const scale = maxDimension / Math.max(scaledWidth, scaledHeight);
            scaledWidth *= scale;
            scaledHeight *= scale;
        }

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        // Draw the scaled image onto the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    };

    const processImage = () => {
        if (!uploadedImage || assets.length === 0) {
            console.error('Uploaded image or assets not available');
            return;
        }

        const canvas = canvasRef.current!;
        const { width, height } = canvas;
        const totalPixels = width * height;
        const pixelThreshold = 10000000; // 10 million pixels

        if (totalPixels > pixelThreshold) {
            const proceed = window.confirm(
                'Processing this image may take a long time and could slow down your browser. Do you want to proceed?'
            );
            if (!proceed) {
                return;
            }
        }

        onProcessingChange(true);
        setProgress(0); // Reset progress

        const ctx = canvas.getContext('2d')!;

        const imageData = ctx.getImageData(0, 0, width, height);

        // Initialize the worker
        const worker = new ImageProcessorWorker();

        worker.postMessage({ imageData, assets, chunkSize, algorithm, overlap });

        worker.onmessage = (event: MessageEvent) => {
            if (event.data.progress !== undefined) {
                setProgress(event.data.progress); // Update progress
                return;
            }

            const { processedImageData, iconUsage: receivedIconUsage } = event.data as {
                processedImageData: ImageData;
                iconUsage: IconUsageMap;
            };

            // Draw the processed image
            ctx.putImageData(processedImageData, 0, 0);

            // Draw overlays if enabled
            if (showWatermark && watermarkImage) {
                drawWatermark(ctx, width, height);
            }

            if (showIconUsageOverlay && Object.keys(receivedIconUsage).length > 0) {
                drawIconUsageOverlay(ctx, receivedIconUsage, width);
            }

            onProcessingChange(false);
            onMosaicReady(true, receivedIconUsage);
            worker.terminate();
        };

        worker.onerror = (error) => {
            console.error('Worker error:', error);
            onProcessingChange(false);
            setProgress(0); // Reset progress on error
            onMosaicReady(false);
            alert('An error occurred while processing the image. Please try again.');
            worker.terminate();
        };
    };

    const downloadImage = () => {
        const canvas = canvasRef.current!;
        canvas.toBlob((blob) => {
            if (blob) {
                const link = document.createElement('a');
                link.download = 'mosaic.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            } else {
                console.error('Failed to create blob for download.');
            }
        }, 'image/png');
    };

    // Load watermark image
    useEffect(() => {
        if (showWatermark) {
            const loadWatermark = async () => {
                try {
                    const watermarkSrc = 'statelesslabsdota2.svg'; // Update with actual path
                    const img = await loadImage(watermarkSrc);
                    setWatermarkImage(img);
                } catch (err) {
                    console.error('Failed to load watermark image:', err);
                }
            };

            loadWatermark();
        } else {
            setWatermarkImage(null);
        }
    }, [showWatermark]);

    // Function to draw watermark
    const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (!watermarkImage) return;

        const watermarkWidth = 100; // Adjust as needed
        const watermarkHeight = (watermarkImage.height / watermarkImage.width) * watermarkWidth;
        const x = width - watermarkWidth - 10; // 10px from the right
        const y = height - watermarkHeight - 10; // 10px from the bottom

        ctx.globalAlpha = 0.75;
        ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
        ctx.globalAlpha = 1.0;
    };

    // Function to draw icon usage overlay
    const drawIconUsageOverlay = (ctx: CanvasRenderingContext2D, usageMap: IconUsageMap, width: number) => {
        const boxWidth = 200;
        const boxHeight = Object.keys(usageMap).length * 20 + 10; // 10px padding

        // Background box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(width - boxWidth - 10, 10, boxWidth, boxHeight);

        // Border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.strokeRect(width - boxWidth - 10, 10, boxWidth, boxHeight);

        // Text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        let yPosition = 25;
        for (const [iconName, count] of Object.entries(usageMap)) {
            if (count > 0) { // Omit icons with 0 usage
                ctx.fillText(`${iconName}: ${count}`, width - boxWidth - 5, yPosition);
                yPosition += 15;
            }
        }
    };

    return (
        <div className="my-4 flex flex-col items-center">
            <div className="relative w-full max-w-full flex justify-center">
                <canvas
                    ref={canvasRef}
                    className="border border-gray-300 w-full h-auto max-w-full"
                />
                {processing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
                        <p className="text-gray-700">Processing image...</p>
                        <progress value={progress} max="100" className="mt-2 w-3/4" />
                        <span className="mt-1 text-gray-600">{Math.round(progress)}%</span>
                    </div>
                )}
            </div>
            {uploadedImage && !processing && !mosaicReady && (
                <button
                    onClick={processImage}
                    className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-full max-w-xs mx-auto"
                >
                    Convert to Mosaic
                </button>
            )}
            {mosaicReady && (
                <>
                    <button
                        onClick={downloadImage}
                        className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded w-full max-w-xs mx-auto"
                    >
                        Download Mosaic Image
                    </button>
                    <p className="mt-2 text-gray-600 text-center">
                        Right-click the image to save it.
                    </p>
                </>
            )}
        </div>
    );
};

export default CanvasDisplay;
