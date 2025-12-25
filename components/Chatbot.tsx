
import { GoogleGenAI, Type, FunctionDeclaration, Chat } from '@google/genai';
import React, { useState, useEffect, useRef } from 'react';
import type { Block, WeatherData } from '../types';
import { fetchWeatherData } from '../services/weatherService';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBlock: (blockData: Omit<Block, 'id' | 'hash' | 'previousHash'>) => Promise<void>;
}

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getWeatherFunctionDeclaration: FunctionDeclaration = {
    name: 'getWeatherForLocation',
    parameters: {
        type: Type.OBJECT,
        description: 'Gets the current weather for a given location, specified by country, state/province, and district/city.',
        properties: {
            country: {
                type: Type.STRING,
                description: 'The country of the location.',
            },
            state: {
                type: Type.STRING,
                description: 'The state, province, or region of the location.',
            },
            district: {
                type: Type.STRING,
                description: 'The district, city, or specific area.',
            },
        },
        required: ['country', 'state', 'district'],
    },
};

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, onAddBlock }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hi! I'm your weather assistant. How can I help you today? You can ask me things like 'What's the weather in Paris, France?'", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            const chat = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    tools: [{ functionDeclarations: [getWeatherFunctionDeclaration] }],
                },
            });
            chatRef.current = chat;
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!chatRef.current) throw new Error("Chat not initialized");

            let response = await chatRef.current.sendMessage({ message: inputValue });
            
            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0];
                if (fc.name === 'getWeatherForLocation') {
                    const location = fc.args as { country: string, state: string, district: string };
                    
                    const weatherData = await fetchWeatherData(location);
                    
                    const newBlockData = {
                        ...location,
                        weather: weatherData,
                        timestamp: new Date().toISOString(),
                    };
                    
                    await onAddBlock(newBlockData);

                    const weatherSummary = `Here's the weather for ${location.district}: It's ${weatherData.condition} with a temperature of ${weatherData.temperatureCelsius}°C and ${weatherData.humidityPercent}% humidity.`;

                    response = await chatRef.current.sendMessage({ functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { result: weatherSummary }
                    }]});
                }
            }
            
            const botMessage: Message = { text: response.text, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: Message = { text: "Sorry, I encountered an error. Please try again.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 right-0 h-full w-full md:h-auto md:max-h-[80vh] md:w-96 md:bottom-24 md:right-6 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-lg shadow-2xl flex flex-col transition-transform duration-300">
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-cyan-400">Weather Assistant</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-800 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            {msg.text}
                        </p>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-700">
                           <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about the weather..."
                        className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <button type="submit" className="bg-cyan-600 text-white p-2 rounded-r-lg hover:bg-cyan-500 disabled:bg-gray-600" disabled={isLoading}>
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};
