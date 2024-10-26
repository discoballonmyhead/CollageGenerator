import React, { useRef, useState } from 'react';

interface Props {
    onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<Props> = ({ onImageUpload }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = () => {
        const file = inputRef.current?.files?.[0];
        if (file && validateFileType(file)) {
            setError('');
            onImageUpload(file);
        } else {
            setError('Please upload a valid image file (except WebP).');
        }
    };

    const validateFileType = (file: File) => {
        const allowedTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/bmp',
            'image/tiff',
            'image/heic',
            'image/heif',
            'image/svg+xml',
            // Exclude WebP
        ];
        return allowedTypes.includes(file.type);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (validateFileType(file)) {
                setError('');
                onImageUpload(file);
            } else {
                setError('Please upload a valid image file (except WebP).');
            }
            e.dataTransfer.clearData();
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className={`my-4 border-2 border-dashed rounded p-8 cursor-pointer transition-colors w-full max-w-md mx-auto ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.bmp,.tiff,.heic,.heif,.svg,image/png,image/jpeg,image/gif,image/bmp,image/tiff,image/heic,image/heif,image/svg+xml"
                ref={inputRef}
                onChange={handleUpload}
                className="hidden"
            />
            <p className="text-gray-500 text-center">
                Click or drag and drop an image file here to upload (WebP not supported)
            </p>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
    );
};

export default ImageUploader;
