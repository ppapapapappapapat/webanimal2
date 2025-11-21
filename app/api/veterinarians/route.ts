import { NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
const veterinarians = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Small Animals',
    location: 'Downtown Animal Clinic',
    distance: 1.2,
    rating: 4.8,
    availableSlots: ['2025-06-15 09:00', '2025-06-15 11:30', '2025-06-16 14:00'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Exotic Animals',
    location: 'Exotic Pet Care Center',
    distance: 2.5,
    rating: 4.9,
    availableSlots: ['2025-06-15 10:00', '2025-06-16 13:30', '2025-06-17 09:00'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialty: 'Birds',
    location: 'Avian Wellness Center',
    distance: 3.7,
    rating: 4.7,
    availableSlots: ['2025-06-16 11:00', '2025-06-17 14:30', '2025-06-18 10:00'],
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Large Animals',
    location: 'Farm Animal Hospital',
    distance: 5.1,
    rating: 4.6,
    availableSlots: ['2025-06-15 08:00', '2025-06-16 09:30', '2025-06-17 13:00'],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 5,
    name: 'Dr. Lisa Thompson',
    specialty: 'Small Animals',
    location: 'Sunset Pet Hospital',
    distance: 1.9,
    rating: 4.5,
    availableSlots: ['2025-06-16 10:00', '2025-06-17 11:30', '2025-06-18 15:00'],
    image: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  }
];

export async function GET(request: Request) {
  // Get specialty from query params (if any)
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get('specialty');
  
  let result = [...veterinarians];
  
  // Filter by specialty if provided
  if (specialty) {
    result = result.filter(vet => 
      vet.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }
  
  // Sort by distance
  result.sort((a, b) => a.distance - b.distance);
  
  // Simulate a slight delay like a real API would have
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real app, this would save the appointment to a database
    // For now we just return a success response
    
    return NextResponse.json({ 
      success: true, 
      message: 'Appointment booked successfully',
      appointmentDetails: {
        veterinarianId: body.veterinarianId,
        veterinarianName: veterinarians.find(v => v.id === body.veterinarianId)?.name,
        date: body.date,
        bookingId: 'APT' + Math.floor(Math.random() * 1000000)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to book appointment' },
      { status: 400 }
    );
  }
} 