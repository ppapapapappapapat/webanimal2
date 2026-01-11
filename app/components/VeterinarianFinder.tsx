'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Veterinarian = {
  id: number;
  name: string;
  specialty: string;
  location: string;
  distance: number;
  rating: number;
  availableSlots: string[];
  image: string;
};

export default function VeterinarianFinder() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Fetch vets data from API
  const searchVets = async () => {
    setLoading(true);
    
    try {
      // Build query string
      let queryParams = new URLSearchParams();
      if (specialty) queryParams.append('specialty', specialty);
      
      // Fetch from API
      const response = await fetch(`/api/veterinarians?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch veterinarians');
      }
      
      const data = await response.json();
      setVets(data);
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      // In a real app, we would show an error notification here
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (vet: Veterinarian) => {
    setSelectedVet(vet);
  };

  const confirmAppointment = async () => {
    if (!selectedVet || !appointmentDate) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/veterinarians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          veterinarianId: selectedVet.id,
          date: appointmentDate,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBookingSuccess(true);
        setBookingDetails(data.appointmentDetails);
      } else {
        // Handle error
        console.error('Booking failed:', data.message);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setSelectedVet(null);
    setAppointmentDate('');
    setBookingSuccess(false);
    setBookingDetails(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Find a Veterinarian</h1>
        
        {bookingSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment with {selectedVet?.name} on {new Date(appointmentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })} has been booked successfully.
            </p>
            {bookingDetails && (
              <div className="bg-white p-4 rounded-lg shadow-sm mx-auto max-w-sm mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Booking Reference</h3>
                <p className="text-blue-600 font-mono text-lg">{bookingDetails.bookingId}</p>
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={resetBooking}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Find Another Veterinarian
              </button>
            </div>
          </div>
        ) : selectedVet ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <button
                onClick={() => setSelectedVet(null)}
                className="text-blue-600 mb-4 flex items-center hover:underline"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to results
              </button>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <img 
                      src={selectedVet.image} 
                      alt={selectedVet.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedVet.name}</h2>
                  <p className="text-blue-600 font-medium">{selectedVet.specialty}</p>
                  
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{selectedVet.location} ({selectedVet.distance} miles away)</span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-yellow-400 mr-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(selectedVet.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600">{selectedVet.rating} out of 5</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-3">Available Appointment Slots</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {selectedVet.availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setAppointmentDate(slot)}
                          className={`py-2 px-4 border rounded-md text-left transition-colors ${
                            appointmentDate === slot
                              ? 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {new Date(slot).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={confirmAppointment}
                      disabled={!appointmentDate || loading}
                      className={`mt-4 py-2 px-6 rounded-lg transition duration-200 ${
                        !appointmentDate
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } w-full`}
                    >
                      {loading ? 'Processing...' : 'Book Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-gray-700 mb-2">Your Location</label>
                  <input
                    id="location"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your address or zip code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="specialty" className="block text-gray-700 mb-2">Animal Type / Specialty</label>
                  <select
                    id="specialty"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    <option value="">Any Specialty</option>
                    <option value="Small Animals">Small Animals</option>
                    <option value="Large Animals">Large Animals</option>
                    <option value="Exotic Animals">Exotic Animals</option>
                    <option value="Birds">Birds</option>
                    <option value="Reptiles">Reptiles</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={searchVets}
                disabled={loading}
                className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                {loading ? 'Searching...' : 'Find Veterinarians'}
              </button>
            </div>
            
            {vets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Available Veterinarians</h2>
                <div className="space-y-4">
                  {vets.map(vet => (
                    <div key={vet.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                      <div className="p-4 flex flex-col md:flex-row">
                        <div className="md:w-1/5 mb-4 md:mb-0">
                          <div className="aspect-square relative rounded-lg overflow-hidden">
                            <img 
                              src={vet.image} 
                              alt={vet.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        
                        <div className="md:w-3/5 md:px-4">
                          <h3 className="text-lg font-semibold text-gray-900">{vet.name}</h3>
                          <p className="text-blue-600">{vet.specialty}</p>
                          
                          <div className="mt-2 text-sm text-gray-500">
                            <div className="flex items-center mb-1">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {vet.location}
                            </div>
                            
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              {vet.distance} miles away
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <div className="flex items-center text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.floor(vet.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm ml-1">{vet.rating}</span>
                          </div>
                        </div>
                        
                        <div className="md:w-1/5 flex items-center justify-center mt-4 md:mt-0">
                          <button
                            onClick={() => handleBookAppointment(vet)}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 w-full md:w-auto"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 