
import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
      enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Windy'],
      description: "The current weather condition.",
    },
    windSpeedKPH: {
      type: Type.NUMBER,
      description: "The current wind speed in kilometers per hour.",
    },
  },
  required: ["temperatureCelsius", "humidityPercent", "condition", "windSpeedKPH"],
};


export const fetchWeatherData = async (country: string): Promise<WeatherData> => {
  try {
    const prompt = `Generate a realistic current weather report for ${country}. Provide the data strictly in the requested JSON format.`;
    
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

    // Sanitize response by removing potential markdown backticks
    const sanitizedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const weatherData: WeatherData = JSON.parse(sanitizedText);
    
    return weatherData;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error(`Failed to fetch weather data for ${country}. Please try again.`);
  }
};
