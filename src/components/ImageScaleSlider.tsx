import React from 'react';

interface Props {
    scaleFactor: number;
    onScaleFactorChange: (value: number) => void;
    disabled: boolean;
}

const ImageScaleSlider: React.FC<Props> = ({ scaleFactor, onScaleFactorChange, disabled }) => {
    const scalingFactors = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]; // increases the sizze of the image, so need to add that dislaimer for the user in future
    const maxSliderValue = scalingFactors.length - 1;
    const currentSliderValue = scalingFactors.indexOf(scaleFactor);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(e.target.value);
        onScaleFactorChange(scalingFactors[index]);
    };

    return (
        <div className="my-4 w-full max-w-md mx-auto">
            <label htmlFor="scaleFactor" className="block text-gray-700 mb-2 text-center">
                Select Image Scaling Factor: {scaleFactor}x
            </label>
            <input
                type="range"
                id="scaleFactor"
                name="scaleFactor"
                min="0"
                max={maxSliderValue}
                value={currentSliderValue}
                onChange={handleSliderChange}
                disabled={disabled}
                className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                step="1"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                {scalingFactors.map((factor, index) => (
                    <span key={index}>{factor}x</span>
                ))}
            </div>
        </div>
    );
};

export default ImageScaleSlider;
