import React from 'react';
import { FiCheck } from 'react-icons/fi';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Akun' },
    { number: 2, title: 'Pribadi' },
    { number: 3, title: 'Keluarga' },
    { number: 4, title: 'Akademik' },
    { number: 5, title: 'Berkas' },
    { number: 6, title: 'Final' },
  ];

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {/* Progress Track Background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
        
        {/* Active Progress Track */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-700"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isActive = currentStep >= step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-bold text-sm md:text-base transition-all duration-500 shadow-sm ${
                  isActive 
                    ? 'bg-emerald-700 text-white shadow-emerald-900/20' 
                    : 'bg-white text-gray-400 border border-gray-100'
                } ${currentStep === step.number ? 'ring-4 ring-emerald-500/10 scale-110' : ''}`}
              >
                {isCompleted ? <FiCheck size={20} /> : step.number}
              </div>
              <span className={`absolute -bottom-7 text-[10px] md:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${
                isActive ? 'text-emerald-800' : 'text-gray-300'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
