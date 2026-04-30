import React from 'react';

export default function Logo({ size = 40, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F69F8" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
        <filter id="logo-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Glow Ring */}
      <circle cx="50" cy="35" r="28" stroke="url(#logo-grad-main)" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5" />
      
      {/* Stylized Book Base */}
      <path 
        d="M20 75C20 75 35 65 50 72C65 65 80 75 80 75V55C80 55 65 45 50 52C35 45 20 55 20 55V75Z" 
        fill="url(#logo-grad-main)" 
        opacity="0.9"
      />
      <path 
        d="M50 52V72" 
        stroke="white" 
        strokeWidth="0.5" 
        opacity="0.3"
      />
      
      {/* Human Figure (V-Shape) */}
      <path 
        d="M38 52C42 45 45 42 50 42C55 42 58 45 62 52" 
        stroke="url(#logo-grad-main)" 
        strokeWidth="5" 
        strokeLinecap="round"
      />
      <circle cx="50" cy="38" r="4" fill="url(#logo-grad-main)" />
      
      {/* Neural Brain Core */}
      <g filter="url(#logo-glow-filter)">
        {/* Left Side: Organic */}
        <path 
          d="M48 32C48 32 46 20 38 20C30 20 28 28 32 32C28 36 32 42 38 42C46 42 48 32 48 32Z" 
          fill="url(#logo-grad-main)" 
          opacity="0.8"
        />
        {/* Right Side: Digital/Circuit */}
        <path 
          d="M52 32C52 32 54 20 62 20C70 20 72 28 68 32C72 36 68 42 62 42C54 42 52 32 52 32Z" 
          fill="url(#logo-grad-main)" 
        />
        {/* Circuit Lines on Right */}
        <path d="M58 25H65" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <path d="M60 30H68" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <path d="M58 35H65" stroke="white" strokeWidth="0.5" opacity="0.5" />
      </g>
      
      {/* Central Star Burst */}
      <g className="animate-pulse">
        <circle cx="50" cy="32" r="2" fill="white" />
        <path d="M50 28V36M46 32H54" stroke="white" strokeWidth="0.5" />
      </g>
      
      {/* Floating Stars */}
      <circle cx="25" cy="30" r="0.5" fill="url(#logo-grad-main)" opacity="0.6" />
      <circle cx="75" cy="25" r="0.5" fill="url(#logo-grad-main)" opacity="0.6" />
      <circle cx="85" cy="45" r="0.5" fill="url(#logo-grad-main)" opacity="0.6" />
    </svg>
  );
}

