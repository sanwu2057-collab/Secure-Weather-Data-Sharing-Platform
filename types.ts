
export interface WeatherData {
  temperatureCelsius: number;
  humidityPercent: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Snowy' | 'Windy' | 'Foggy' | 'Hazy';
  windSpeedKPH: number;
  precipitationChancePercent: number;
  precipitationAmountMM: number;
  uvIndex: number;
  visibilityKM: number;
  airPressureHPA: number;
  windDirection: string;
  severeWeatherAlert: string;
}

export interface Block {
  id: number;
  country: string;
  state: string;
  district: string;
  weather: WeatherData;
  timestamp: string;
  hash: string;
  previousHash: string;
}
