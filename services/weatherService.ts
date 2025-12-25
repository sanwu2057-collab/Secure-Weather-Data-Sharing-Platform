
import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const weatherSchema = {
  type: Type.OBJECT,
  properties: {
    temperatureCelsius: {
      type: Type.NUMBER,
      description: "The current temperature in Celsius.",
    },
    humidityPercent: {
      type: Type.NUMBER,
      description: "The current humidity in percentage.",
    },
    condition: {
      type: Type.STRING,
      enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Windy', 'Foggy', 'Hazy'],
      description: "The current weather condition.",
    },
    windSpeedKPH: {
      type: Type.NUMBER,
      description: "The current wind speed in kilometers per hour.",
    },
    precipitationChancePercent: {
        type: Type.NUMBER,
        description: "The chance of precipitation in percentage (0-100)."
    },
    precipitationAmountMM: {
        type: Type.NUMBER,
        description: "The amount of precipitation in the last hour in millimeters."
    },
    uvIndex: {
        type: Type.NUMBER,
        description: "The UV index (0-11+)."
    },
    visibilityKM: {
        type: Type.NUMBER,
        description: "The visibility in kilometers."
    },
    airPressureHPA: {
        type: Type.NUMBER,
        description: "The atmospheric pressure in hectopascals (hPa)."
    },
    windDirection: {
        type: Type.STRING,
        description: "The wind direction (e.g., N, S, E, W, NW, SE)."
    },
    severeWeatherAlert: {
        type: Type.STRING,
        description: "Any severe weather alert, or 'None' if there isn't one."
    }
  },
  required: [
    "temperatureCelsius", 
    "humidityPercent", 
    "condition", 
    "windSpeedKPH",
    "precipitationChancePercent", 
    "precipitationAmountMM", 
    "uvIndex",
    "visibilityKM", 
    "airPressureHPA", 
    "windDirection", 
    "severeWeatherAlert"
],
};


export const fetchWeatherData = async (location: { country: string; state: string; district: string; }): Promise<WeatherData> => {
  const { country, state, district } = location;
  const locationString = [district, state, country].filter(Boolean).join(', ');

  try {
    const prompt = `Generate a realistic current weather report for ${locationString}. This data is for farmers, agri-tech, disaster management, and transport companies. Include temperature, humidity, condition, wind speed, chance and amount of precipitation, UV index, visibility, air pressure, wind direction, and any severe weather alerts (or 'None'). Provide the data strictly in the requested JSON format.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: weatherSchema,
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Received an empty response from the API.");
    }

    const sanitizedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const weatherData: WeatherData = JSON.parse(sanitizedText);
    
    return weatherData;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error(`Failed to fetch weather data for ${locationString}. Please try again.`);
  }
};
