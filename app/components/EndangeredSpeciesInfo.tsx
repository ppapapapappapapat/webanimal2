'use client';

import React, { useState, useEffect } from 'react';

type EndangeredSpecies = {
  id: number;
  name: string;
  scientificName: string;
  status: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened';
  population: string;
  habitat: string;
  threats: string[];
  image: string;
};

export default function EndangeredSpeciesInfo() {
  const [endangeredSpeciesData, setEndangeredSpeciesData] = useState<EndangeredSpecies[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<EndangeredSpecies | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecies, setFilteredSpecies] = useState<EndangeredSpecies[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch endangered species data from JSON file
    async function fetchEndangeredSpecies() {
      try {
        const response = await fetch('/data/endangered-species.json');
        if (!response.ok) {
          throw new Error('Failed to fetch endangered species data');
        }
        const data = await response.json();
        setEndangeredSpeciesData(data);
        setFilteredSpecies(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching endangered species data:', error);
        setIsLoading(false);
      }
    }

    fetchEndangeredSpecies();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSpecies(endangeredSpeciesData);
    } else {
      const filtered = endangeredSpeciesData.filter(species => 
        species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpecies(filtered);
    }
  }, [searchTerm, endangeredSpeciesData]);

  const handleSpeciesClick = (species: EndangeredSpecies) => {
    setSelectedSpecies(species);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 animate-fade-in">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 rounded-full border-blue-600 border-t-transparent animate-spin mb-4"></div>
          <p>Loading endangered species data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6 animate-slide-in-top">
        <div className="relative">
          <input
            type="text"
            placeholder="Search endangered species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4 animate-slide-in-left">
          <h3 className="text-lg font-medium mb-4">Endangered Species List</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredSpecies.map((species, index) => (
              <div 
                key={species.id}
                onClick={() => handleSpeciesClick(species)}
                className={`p-3 border rounded-md cursor-pointer transition-all duration-300 hover:shadow-md staggered-item animate-fade-in ${
                  selectedSpecies?.id === species.id 
                    ? 'bg-blue-50 border-blue-300 shadow-md' 
                    : 'hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={species.image} 
                      alt={species.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{species.name}</h4>
                    <p className="text-xs text-gray-500">{species.scientificName}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                      species.status === 'Critically Endangered' 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : species.status === 'Endangered'
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : species.status === 'Vulnerable'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}>
                      {species.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredSpecies.length === 0 && (
              <div className="p-4 text-center text-gray-500 animate-fade-in">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>No species found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-4 animate-slide-in-right">
          {selectedSpecies ? (
            <div className="animate-fade-in">
              <div className="w-full h-48 rounded-md overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedSpecies.image} 
                  alt={selectedSpecies.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold mb-1 animate-slide-in-bottom">{selectedSpecies.name}</h3>
              <p className="text-sm italic text-gray-600 mb-4 animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>{selectedSpecies.scientificName}</p>
              
              <div className="space-y-3">
                <div className="animate-slide-in-bottom" style={{ animationDelay: '0.15s' }}>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <p className={`text-sm py-1 px-2 inline-block rounded ${
                    selectedSpecies.status === 'Critically Endangered' 
                      ? 'bg-red-100 text-red-800'
                      : selectedSpecies.status === 'Endangered'
                        ? 'bg-orange-100 text-orange-800'
                        : selectedSpecies.status === 'Vulnerable'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedSpecies.status}
                  </p>
                </div>
                <div className="animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
                  <h4 className="text-sm font-medium text-gray-700">Population</h4>
                  <p className="text-sm">{selectedSpecies.population}</p>
                </div>
                <div className="animate-slide-in-bottom" style={{ animationDelay: '0.25s' }}>
                  <h4 className="text-sm font-medium text-gray-700">Habitat</h4>
                  <p className="text-sm">{selectedSpecies.habitat}</p>
                </div>
                <div className="animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
                  <h4 className="text-sm font-medium text-gray-700">Threats</h4>
                  <ul className="list-disc list-inside text-sm">
                    {selectedSpecies.threats.map((threat, index) => (
                      <li key={index} className="staggered-item" style={{ animationDelay: `${0.35 + (index * 0.05)}s` }}>{threat}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 p-3 rounded-md border border-blue-100 animate-slide-in-bottom" style={{ animationDelay: '0.45s' }}>
                <h4 className="text-sm font-medium text-blue-800 mb-2">How You Can Help</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-blue-700">
                  <li className="staggered-item">Support conservation organizations</li>
                  <li className="staggered-item">Raise awareness about endangered species</li>
                  <li className="staggered-item">Report illegal wildlife activities</li>
                  <li className="staggered-item">Reduce your environmental footprint</li>
                </ul>
              </div>
              
              <div className="mt-4 animate-slide-in-bottom" style={{ animationDelay: '0.55s' }}>
                <button
                  className="btn-secondary w-full"
                  onClick={() => window.open('https://haribon.org.ph/', '_blank')}
                >
                  Learn More About Conservation
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
              <svg className="w-16 h-16 text-gray-300 mb-4 animate-pulse-once" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="animate-fade-in">Select a species to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}