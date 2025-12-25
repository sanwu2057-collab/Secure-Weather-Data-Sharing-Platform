
import React from 'react';
import type { Block } from '../types';
import { SunIcon, CloudIcon, RainIcon, StormIcon, SnowyIcon, WindyIcon, FoggyIcon, HazyIcon } from './icons/WeatherIcons';
import { ThermometerIcon } from './icons/ThermometerIcon';
import { DropIcon } from './icons/DropIcon';
import { WindIcon } from './icons/WindIcon';
import { AlertIcon } from './icons/AlertIcon';
import { PrecipitationIcon } from './icons/PrecipitationIcon';
import { UVIndexIcon } from './icons/UVIndexIcon';
import { VisibilityIcon } from './icons/VisibilityIcon';
import { AirPressureIcon } from './icons/AirPressureIcon';
import { WindDirectionIcon } from './icons/WindDirectionIcon';

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
    case 'Foggy':
        return <FoggyIcon className="w-12 h-12 text-gray-400" />;
    case 'Hazy':
        return <HazyIcon className="w-12 h-12 text-gray-500" />;
    default:
      return <CloudIcon className="w-12 h-12 text-gray-400" />;
  }
};

const MetricDisplay: React.FC<{ icon: React.ReactElement; value: string | number; label: string; }> = ({ icon, value, label }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-md">
      {icon}
      <div>
        <span className="font-semibold text-lg">{value}</span>
        <span className="block text-xs text-gray-400">{label}</span>
      </div>
    </div>
  );

export const WeatherBlock: React.FC<WeatherBlockProps> = ({ block }) => {
  const { id, country, state, district, weather, timestamp, hash, previousHash } = block;

  const locationName = [district, state, country].filter(Boolean).join(', ');

  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-lg shadow-lg p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10">
      {weather.severeWeatherAlert && weather.severeWeatherAlert.toLowerCase() !== 'none' && (
        <div className="flex items-center p-3 mb-4 bg-red-900/50 border border-red-500/50 rounded-lg">
          <AlertIcon className="w-6 h-6 mr-3 text-red-400 flex-shrink-0" />
          <span className="font-semibold text-red-300">{weather.severeWeatherAlert}</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">Block #{id} - {locationName}</h3>
          <p className="text-xs text-gray-400">{new Date(timestamp).toLocaleString()}</p>
        </div>
        <div className="text-right">
            <WeatherConditionIcon condition={weather.condition} />
            <p className="font-semibold text-lg">{weather.condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <MetricDisplay icon={<ThermometerIcon className="w-6 h-6 text-red-400" />} value={`${weather.temperatureCelsius}°C`} label="Temperature" />
        <MetricDisplay icon={<DropIcon className="w-6 h-6 text-blue-300" />} value={`${weather.humidityPercent}%`} label="Humidity" />
        <MetricDisplay icon={<WindIcon className="w-6 h-6 text-teal-300" />} value={`${weather.windSpeedKPH} kph`} label="Wind Speed" />
      </div>

      <div>
        <h4 className="text-lg font-semibold text-cyan-300 border-b border-cyan-500/20 pb-1 mb-4">Additional Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricDisplay icon={<PrecipitationIcon className="w-6 h-6 text-sky-400" />} value={`${weather.precipitationChancePercent}%`} label="Precipitation" />
            <MetricDisplay icon={<UVIndexIcon className="w-6 h-6 text-purple-400" />} value={weather.uvIndex} label="UV Index" />
            <MetricDisplay icon={<VisibilityIcon className="w-6 h-6 text-gray-300" />} value={`${weather.visibilityKM} km`} label="Visibility" />
            <MetricDisplay icon={<AirPressureIcon className="w-6 h-6 text-orange-400" />} value={`${weather.airPressureHPA} hPa`} label="Pressure" />
            <MetricDisplay icon={<WindDirectionIcon className="w-6 h-6 text-green-400" />} value={weather.windDirection} label="Wind Direction" />
            <MetricDisplay icon={<PrecipitationIcon className="w-6 h-6 text-sky-400 opacity-70" />} value={`${weather.precipitationAmountMM} mm`} label="Precip. Amount" />
        </div>
      </div>

      <div className="font-mono text-xs text-gray-500 space-y-2 mt-6 border-t border-gray-700 pt-4">
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
