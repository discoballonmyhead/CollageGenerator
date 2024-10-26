import React from 'react';

interface Props {
    onReset: () => void;
}

const ResetButton: React.FC<Props> = ({ onReset }) => {
    return (
        <button
            onClick={onReset}
            className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded w-full sm:w-auto"
        >
            Reset
        </button>
    );
};

export default ResetButton;