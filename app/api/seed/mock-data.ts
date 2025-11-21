// Static mock data for seeding the database
// This is a simplified version to ensure the database has initial data
import { Role } from '@/app/generated/prisma';

export const mockUsers = [
  {
    id: 'user_1',
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'admin123', // Will be hashed
    role: Role.ADMIN,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'user_2',
    email: 'user@example.com',
    name: 'Regular User',
    password: 'user123', // Will be hashed
    role: Role.USER,
    createdAt: new Date('2025-01-02'),
  }
];

export const mockAnimals = [
  {
    id: 'animal_1',
    name: 'Leo',
    species: 'Lion',
    gender: 'Male',
    age: 5,
    weight: 190.5,
    height: 120.0,
    health: 'Healthy',
    description: 'A majestic lion with a golden mane. Very docile.',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date('2025-02-01'),
  },
  {
    id: 'animal_2',
    name: 'Ellie',
    species: 'Elephant',
    gender: 'Female',
    age: 12,
    weight: 2500.0,
    height: 310.0,
    health: 'Healthy',
    description: 'African elephant with distinctive tusks. Very intelligent.',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date('2025-02-05'),
  },
  {
    id: 'animal_3',
    name: 'Zara',
    species: 'Zebra',
    gender: 'Female',
    age: 3,
    weight: 350.0,
    height: 130.0,
    health: 'Healthy',
    description: 'Young zebra with unique stripe pattern.',
    imageUrl: 'https://images.unsplash.com/photo-1526095179574-86e545346ae6?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date('2025-02-10'),
  }
];

export const mockDetections = [
  {
    id: 'detection_1',
    userId: 'user_1',
    animalId: 'animal_1',
    location: 'Sector A, East Safari',
    timestamp: new Date('2025-03-15'),
    confidence: 0.95,
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80',
    notes: 'Spotted during morning patrol. Animal appeared healthy.',
    status: 'confirmed'
  },
  {
    id: 'detection_2',
    userId: 'user_2',
    animalId: 'animal_2',
    location: 'Sector B, North Area',
    timestamp: new Date('2025-03-18'),
    confidence: 0.92,
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80',
    notes: 'Observed during water break. Normal behavior.',
    status: 'confirmed'
  }
]; 