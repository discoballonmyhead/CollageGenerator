// src/components/OverlapSlider.tsx

import React from 'react';

interface Props {
    overlap: number;
    onOverlapChange: (value: number) => void;
    disabled: boolean;
}

const OverlapSlider: React.FC<Props> = ({ overlap, onOverlapChange, disabled }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onOverlapChange(Number(e.target.value));
    };

    return (
        <div className="my-4 w-full max-w-md mx-auto">
            <label htmlFor="overlap" className="block text-gray-700 mb-2 text-center">
                Icon Overlap Density: {overlap}%
            </label>
            <input
                type="range"
                id="overlap"
                name="overlap"
                min="0"
                max="70"
                step="10"
                value={overlap}
                onChange={handleChange}
                disabled={disabled}
                className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
                <span>60%</span>
                <span>70%</span>
            </div>
        </div>
    );
};

export default OverlapSlider;
