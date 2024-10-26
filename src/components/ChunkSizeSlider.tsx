import React from 'react';

interface Props {
    chunkSize: number;
    onChunkSizeChange: (value: number) => void;
    disabled: boolean;
}

const ChunkSizeSlider: React.FC<Props> = ({ chunkSize, onChunkSizeChange, disabled }) => {
    const chunkSizes = [1, 2, 4, 8, 16, 32, 64, 128];

    const maxSliderValue = chunkSizes.length - 1;

    const currentSliderValue = chunkSizes.indexOf(chunkSize);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(e.target.value);
        onChunkSizeChange(chunkSizes[index]);
    };

    return (
        <div className="my-4 w-full max-w-md mx-auto">
            <label htmlFor="chunkSize" className="block text-gray-700 mb-2 text-center">
                Select Chunk Size: {chunkSize} x {chunkSize} pixels
            </label>
            <input
                type="range"
                id="chunkSize"
                name="chunkSize"
                min="0"
                max={maxSliderValue}
                value={currentSliderValue}
                onChange={handleSliderChange}
                disabled={disabled}
                className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                step="1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                {chunkSizes.map((size, index) => (
                    <span key={index}>{size}</span>
                ))}
            </div>
        </div>
    );
};

export default ChunkSizeSlider;
