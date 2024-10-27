// src/components/IconUsageList.tsx

import React from 'react';
import { IconUsageMap } from '../types';

interface Props {
    iconUsage: IconUsageMap;
}

const IconUsageList: React.FC<Props> = ({ iconUsage }) => {
    // Convert the usage map to an array and filter out icons with 0 usage
    const filteredUsage = Object.entries(iconUsage)
        .filter(([_, count]) => count > 0)
        .map(([iconName, count]) => {
            // Format the icon name:
            // 1. Replace underscores with spaces
            // 2. Remove the word 'icon' (case-insensitive)
            let displayName = iconName.replace(/_/g, ' ');
            displayName = displayName.replace(/\bicon\b/gi, '').trim();

            return { iconName, displayName, count };
        });

    // Debugging: Log filteredUsage to verify correctness
    console.log('Filtered Usage:', filteredUsage);

    // If no icons were used, don't render the list
    if (filteredUsage.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Icon Usage</h2>
            <ul className="bg-gray-100 p-4 rounded shadow">
                {filteredUsage.map(({ iconName, displayName, count }) => (
                    <li key={iconName} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span className="text-gray-700">{displayName}</span>
                        <span className="text-gray-700 font-medium">{count}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default IconUsageList;
