import React from 'react';

const BoschLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 10C27.909 10 10 27.909 10 50s17.909 40 40 40 40-17.909 40-40S72.091 10 50 10zm0 75C30.118 85 15 69.882 15 50S30.118 15 50 15s35 15.118 35 35-15.118 35-35 35z"/>
      <path d="M35 35h30v10H35zM35 50h30v10H35z"/>
      <circle cx="25" cy="40" r="3"/>
      <circle cx="75" cy="40" r="3"/>
      <circle cx="25" cy="55" r="3"/>
      <circle cx="75" cy="55" r="3"/>
    </svg>
  );
};

export default BoschLogo;