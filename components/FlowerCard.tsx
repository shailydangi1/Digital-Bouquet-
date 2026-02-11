
import React from 'react';
import { Flower } from '../types';

interface FlowerCardProps {
  flower: Flower;
  isSelected: boolean;
  onToggle: (flower: Flower) => void;
}

const FlowerCard: React.FC<FlowerCardProps> = ({ flower, isSelected, onToggle }) => {
  return (
    <div 
      onClick={() => onToggle(flower)}
      className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 rounded-2xl overflow-hidden border-2 ${
        isSelected ? 'border-pink-500 ring-4 ring-pink-100' : 'border-transparent bg-white shadow-sm hover:shadow-md'
      }`}
    >
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img 
          src={flower.imageUrl} 
          alt={flower.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-lg scale-110">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 text-center bg-white">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-tight">{flower.name}</h3>
        <p className="text-[10px] md:text-xs text-pink-600 font-medium mt-1 uppercase tracking-tighter">{flower.symbolism}</p>
      </div>
    </div>
  );
};

export default FlowerCard;
