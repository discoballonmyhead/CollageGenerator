import React, { useEffect, useRef, useState } from 'react';
import { AssetImage } from '../types';
import { loadAssetImages, loadImage } from '../utils/imageProcessing';
import heic2any from 'heic2any';
import ImageProcessorWorker from '../workers/imageProcessor.worker.ts?worker';

interface Props {
    imageFile: File | null;
    chunkSize: number;
    scaleFactor: number;
    processing: boolean;
    mosaicReady: boolean;
    onProcessingChange: (isProcessing: boolean) => void;
    onMosaicReady: (isReady: boolean) => void;
}

const CanvasDisplay: React.FC<Props> = ({
    imageFile,
    chunkSize,
    scaleFactor,
    processing,
    mosaicReady,
    onProcessingChange,
    onMosaicReady,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [assets, setAssets] = useState<AssetImage[]>([]);
    const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const preloadAssets = async () => {
            try {
                const loadedAssets = await loadAssetImages();
                setAssets(loadedAssets);
            } catch (err) {
                console.error('Error loading assets:', err);
            }
        };

        preloadAssets();
    }, []);

    useEffect(() => {
        if (imageFile) {

            onMosaicReady(false);
            onProcessingChange(false);
            setProgress(0);

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

        let scaledWidth = img.width * scaleFactor;
        let scaledHeight = img.height * scaleFactor;

        const maxDimension = 4096;
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
        const pixelThreshold = 10000000;

        if (totalPixels > pixelThreshold) {
            const proceed = window.confirm(
                'Processing this image may take a long time and could slow down your browser. Do you want to proceed?'
            );
            if (!proceed) {
                return;
            }
        }

        onProcessingChange(true);
        setProgress(0);
        const ctx = canvas.getContext('2d')!;

        const imageData = ctx.getImageData(0, 0, width, height);

        const worker = new ImageProcessorWorker();

        worker.postMessage({ imageData, assets, chunkSize });

        worker.onmessage = (event: MessageEvent) => {
            if (event.data.progress !== undefined) {
                setProgress(event.data.progress);
                return;
            }

            const { processedImageData } = event.data;
            ctx.putImageData(processedImageData, 0, 0);
            onProcessingChange(false);
            onMosaicReady(true);
            worker.terminate();
        };

        worker.onerror = (error) => {
            console.error('Worker error:', error);
            onProcessingChange(false);
            setProgress(0);
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
