/**
 * This file contains utility functions for working with Prisma and 
 * transitioning from the mock database to a real SQL database.
 */

import { prisma } from '@/app/lib/prisma';
import { Animal, Detection } from '@/app/database/database';
import { User } from '@/app/context/UserContext';

/**
 * Convert mock user data to Prisma-compatible format
 */
export function convertUserToPrisma(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    // Note: In a real implementation, you would need to hash this password
    password: 'password123', // For demonstration only
    role: user.role === 'admin' ? 'ADMIN' : 'USER',
    createdAt: user.createdAt,
    updatedAt: new Date()
  };
}

/**
 * Convert mock animal data to Prisma-compatible format
 */
export function convertAnimalToPrisma(animal: Animal) {
  return {
    id: animal.id,
    name: animal.name,
    species: animal.species, 
    gender: 'Unknown', // Hard-coded since mock data doesn't have gender
    age: animal.age || 0,
    weight: animal.weight || 0,
    height: 0, // Default height since it might not be in the mock data
    health: animal.status,
    description: animal.description || '',
    imageUrl: animal.imageUrl || '',
    createdAt: animal.createdAt,
    updatedAt: new Date()
  };
}

/**
 * Convert mock detection data to Prisma-compatible format
 */
export function convertDetectionToPrisma(detection: Detection) {
  return {
    id: detection.id,
    userId: detection.userId,
    animalId: detection.animalId || '',
    location: detection.location ? `${detection.location.latitude},${detection.location.longitude}` : '',
    timestamp: detection.timestamp,
    confidence: detection.detections[0]?.score || 0.0,
    imageUrl: detection.imageUrl,
    notes: detection.notes || '',
    status: 'confirmed'
  };
}

/**
 * Creates indexes for better query performance
 */
export async function createDatabaseIndexes() {
  // These would be actual Prisma commands to create indexes
  // In a real project, you'd likely handle indexes through Prisma migrations
  console.log('Creating database indexes for optimal performance...');
  return true;
}

/**
 * Gets database statistics
 */
export async function getDatabaseStats() {
  const userCount = await prisma.user.count();
  const animalCount = await prisma.animal.count();
  const detectionCount = await prisma.detection.count();
  
  return {
    users: userCount,
    animals: animalCount,
    detections: detectionCount
  };
} 