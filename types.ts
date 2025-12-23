
export interface WeatherData {
  temperatureCelsius: number;
  humidityPercent: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy' | 'Windy';
  windSpeedKPH: number;
}

export interface Block {
  id: number;
  country: string;
  weather: WeatherData;
  timestamp: string;
  hash: string;
  previousHash: string;
}
