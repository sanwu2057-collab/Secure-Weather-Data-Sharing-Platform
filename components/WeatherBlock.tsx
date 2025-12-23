
import React from 'react';
import type { Block } from '../types';
import { SunIcon, CloudIcon, RainIcon, StormIcon, SnowyIcon, WindyIcon } from './icons/WeatherIcons';
import { ThermometerIcon } from './icons/ThermometerIcon';
import { DropIcon } from './icons/DropIcon';
import { WindIcon } from './icons/WindIcon';

interface WeatherBlockProps {
  block: Block;
}

const WeatherConditionIcon: React.FC<{ condition: string }> = ({ condition }) => {
  switch (condition) {
    case 'Sunny':
      return <SunIcon className="w-12 h-12 text-yellow-400" />;
    case 'Cloudy':
      return <CloudIcon className="w-12 h-12 text-gray-400" />;
    case 'Rainy':
      return <RainIcon className="w-12 h-12 text-blue-400" />;
    case 'Stormy':
      return <StormIcon className="w-12 h-12 text-indigo-400" />;
    case 'Snowy':
        return <SnowyIcon className="w-12 h-12 text-white" />;
    case 'Windy':
        return <WindyIcon className="w-12 h-12 text-gray-300" />;
    default:
      return <CloudIcon className="w-12 h-12 text-gray-400" />;
  }
};

export const WeatherBlock: React.FC<WeatherBlockProps> = ({ block }) => {
  const { id, country, weather, timestamp, hash, previousHash } = block;

  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-lg shadow-lg p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Block #{id} - {country}</h3>
          <p className="text-xs text-gray-400">{new Date(timestamp).toLocaleString()}</p>
        </div>
        <div className="text-right">
            <WeatherConditionIcon condition={weather.condition} />
            <p className="font-semibold text-lg">{weather.condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 text-center">
        <div className="flex flex-col items-center p-3 bg-gray-700/50 rounded-md">
          <ThermometerIcon className="w-6 h-6 mb-2 text-red-400" />
          <span className="font-semibold text-xl">{weather.temperatureCelsius}°C</span>
          <span className="text-xs text-gray-400">Temperature</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-700/50 rounded-md">
          <DropIcon className="w-6 h-6 mb-2 text-blue-300" />
          <span className="font-semibold text-xl">{weather.humidityPercent}%</span>
          <span className="text-xs text-gray-400">Humidity</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-700/50 rounded-md">
          <WindIcon className="w-6 h-6 mb-2 text-teal-300" />
          <span className="font-semibold text-xl">{weather.windSpeedKPH} kph</span>
          <span className="text-xs text-gray-400">Wind Speed</span>
        </div>
      </div>

      <div className="font-mono text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap">
          <span className="w-28 font-semibold text-gray-400">Hash:</span>
          <span className="text-green-400 break-all">{hash}</span>
        </div>
        <div className="flex flex-wrap">
          <span className="w-28 font-semibold text-gray-400">Previous Hash:</span>
          <span className="text-yellow-400 break-all">{previousHash}</span>
        </div>
      </div>
    </div>
  );
};
