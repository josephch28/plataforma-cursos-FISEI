// src/components/Switch.jsx
import React from 'react';

export default function Switch({ checked, onChange, disabled = false, color = 'green' }) {
    // Styles based on checked state and color
    const activeColorClass = {
        blue: 'bg-blue-600',
        red: 'bg-red-500',
        green: 'bg-green-600',
        indigo: 'bg-indigo-600'
    }[color] || 'bg-green-600';

    return (
        <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <div className={`
        w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
        ${checked ? activeColorClass : ''}
      `}></div>
        </label>
    );
}
