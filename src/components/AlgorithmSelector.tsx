// src/components/AlgorithmSelector.tsx

import React from 'react';
import { AlgorithmType } from '../types';

interface Props {
    selectedAlgorithm: AlgorithmType;
    onAlgorithmChange: (algorithm: AlgorithmType) => void;
    disabled: boolean;
}

const AlgorithmSelector: React.FC<Props> = ({ selectedAlgorithm, onAlgorithmChange, disabled }) => {
    return (
        <div className="my-4 w-full max-w-md mx-auto">
            <label htmlFor="algorithm" className="block text-gray-700 mb-2 text-center">
                Select Algorithm:
            </label>
            <select
                id="algorithm"
                value={selectedAlgorithm}
                onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
                disabled={disabled}
                className={`w-full p-2 border border-gray-300 rounded ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="ColorMatch">Color Match</option>
                <option value="HistogramMatch">Histogram Match</option>
                <option value="PatternMatch">Pattern Match</option>
                <option value="RotateMatch">Rotate Match</option>
            </select>
        </div>
    );
};

export default AlgorithmSelector;
