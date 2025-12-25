
import React, { useState } from 'react';
import { CountrySelector } from './components/CountrySelector';
import { WeatherBlock } from './components/WeatherBlock';
import { fetchWeatherData } from './services/weatherService';
import type { WeatherData, Block } from './types';
import { COUNTRIES } from './constants';
import { Chatbot } from './components/Chatbot';
import { ChatIcon } from './components/icons/ChatIcon';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>(COUNTRIES[0].code);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedState('');
    setSelectedDistrict('');
  };

  const createHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-265', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.slice(0, 16);
  };

  const addNewBlock = async (blockData: Omit<Block, 'id' | 'hash' | 'previousHash'>) => {
      const previousHash = blocks.length > 0 ? blocks[0].hash : '0000000000000000';
      const currentHash = await createHash(JSON.stringify(blockData) + previousHash);

      const newBlock: Block = {
          id: blocks.length + 1,
          ...blockData,
          hash: currentHash,
          previousHash: previousHash,
      };
      setBlocks(prevBlocks => [newBlock, ...prevBlocks]);
  };


  const handleFetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;
      const location = {
        country: countryName,
        state: selectedState,
        district: selectedDistrict,
      };

      const weatherData = await fetchWeatherData(location);
      
      const newBlockData = {
        ...location,
        weather: weatherData,
        timestamp: new Date().toISOString(),
      };
      
      await addNewBlock(newBlockData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFetchDisabled = isLoading || !selectedState || !selectedDistrict;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">
            Secure Weather Ledger
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Comprehensive climate data for agriculture, transport, and safety.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 rounded-lg shadow-lg h-fit">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300 border-b-2 border-cyan-500/30 pb-2">Data Acquisition</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="country-select" className="block text-sm font-medium text-gray-300 mb-2">
                  Select Country
                </label>
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onCountryChange={handleCountryChange}
                />
              </div>

              <div>
                <label htmlFor="state-input" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter State / Province
                </label>
                <input
                  id="state-input"
                  type="text"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  placeholder="e.g., California"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label htmlFor="district-input" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter District / City
                </label>
                <input
                  id="district-input"
                  type="text"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  placeholder="e.g., San Francisco"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>

              <button
                onClick={handleFetchData}
                disabled={isFetchDisabled}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-cyan-500/40"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Forging Block...
                  </>
                ) : (
                  'Add New Weather Block'
                )}
              </button>
              {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}
            </div>
          </aside>

          <section className="lg:col-span-2">
            {blocks.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-800/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-300">The Ledger is Empty</h3>
                <p className="text-gray-400 mt-2">Select a location or use the chat assistant to start the chain.</p>
              </div>
            )}
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                  <WeatherBlock block={block} />
                  {index < blocks.length -1 && (
                     <div className="flex justify-center">
                        <div className="h-12 w-1 bg-cyan-700/50 rounded-full"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        </main>
      </div>
      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)}
        onAddBlock={addNewBlock}
      />
      <button 
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110"
        aria-label="Open chat assistant"
      >
        <ChatIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

export default App;