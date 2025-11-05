
import React from 'react';

// This is a simplified vector representation based on the provided image.
export const HeroIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
        </defs>
        <rect width="400" height="300" rx="20" fill="url(#sky)" />
        {/* Ground */}
        <path d="M 0 250 C 80 230, 150 260, 220 250 C 290 240, 350 270, 400 250 L 400 300 L 0 300 Z" fill="#a7f3d0" />

        {/* Child */}
        <g transform="translate(150 100) scale(0.9)">
            {/* Legs */}
            <path d="M 50 120 L 70 100 L 80 130" stroke="#4a5568" fill="none" strokeWidth="12" strokeLinecap="round" />
            <path d="M 80 120 L 100 100 L 110 130" stroke="#4a5568" fill="none" strokeWidth="12" strokeLinecap="round" />
             {/* Shoes */}
            <ellipse cx="75" cy="135" rx="15" ry="8" fill="#3b82f6" />
            <ellipse cx="105" cy="135" rx="15" ry="8" fill="#3b82f6" />
            {/* Body */}
            <rect x="45" y="60" width="70" height="60" rx="10" fill="#facc15" />
            {/* Head */}
            <circle cx="80" cy="40" r="30" fill="#fcd3b7" />
            <path d="M 60 15 C 70 -5, 90 -5, 100 15 L 110 40 L 50 40 Z" fill="#4a5568" />
            <circle cx="70" cy="40" r="3" fill="black" />
            <circle cx="90" cy="40" r="3" fill="black" />
            <path d="M 75 50 Q 80 55, 85 50" stroke="black" fill="none" strokeWidth="2" strokeLinecap="round" />
             {/* Arm and Bottle */}
            <path d="M 115 70 L 140 80" stroke="#fcd3b7" strokeWidth="10" strokeLinecap="round" />
            <rect x="135" y="65" width="20" height="40" rx="8" fill="#34d399" />
            <rect x="140" y="55" width="10" height="10" rx="3" fill="#10b981" />
        </g>
    </svg>
);
